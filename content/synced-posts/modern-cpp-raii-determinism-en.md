---
slug: modern-cpp-raii-determinism-en
title: 'Looking at Modern C++ from Go/Java: RAII, Determinism, and Thread Safety'
description: >-
  Notes on modern C++ from a managed-language perspective: RAII and
  deterministic resource management, mutexes and thread safety, OS execution
  units, and OOP modeling and design methodologies.
date: '2026-11-19'
tags:
  - C++
  - RAII
  - Concurrency
  - Operating System
  - OOP
published: true
lang: en
translationKey: modern-cpp-raii-determinism
---

> These notes come from a HackMD note I wrote around January or February 2026. I compiled them from learning conversations with an AI, reviewed and revised the material myself, and de-identified it before republishing here.

I put these notes together while looking at modern C++ from a background in managed languages like Go/Java. They cover, in order: C++'s deterministic resource management (RAII), mutexes and thread safety, a few operating-system concepts that are easy to mix up, and finally OOP modeling and design methodologies.

## 1. The core philosophy of modern C++: determinism

### How it differs from managed languages (Go/Java)

- **Managed languages (Go/Java):** Come with a heavier runtime and a **garbage collector (GC)**. GC is **centralized, non-deterministic** memory management: the GC decides when an object gets reclaimed, not the structure of your code. A GC cycle can introduce **Stop-The-World (STW)** pauses. Modern collectors like Go's do most of their work concurrently with the program and keep STW phases very short, but the code still doesn't control when memory is actually freed. In workloads that are extremely sensitive to tail latency, such as high-frequency trading, that kind of latency jitter may be unacceptable.

- **Modern C++:** Has no GC and follows the **zero-overhead principle**: you don't pay for features you don't use, and the features you do use are hard to beat by hand. It favors **RAII (Resource Acquisition Is Initialization)**, which is a **distributed, deterministic** model for resource management.

### How RAII works

RAII ties the lifetime of a resource (heap memory, a lock, a file descriptor) to the lifetime of the object that owns it. In the most common case, a smart pointer like `std::unique_ptr` lives on the **stack**. When execution leaves the scope, whether by finishing normally, returning early, or unwinding the stack during an exception (assuming the exception is eventually caught; if it goes uncaught, the program calls `std::terminate`, and whether the stack unwinds first is implementation-defined), its **destructor** runs and frees the resource on the **heap** at a **known, predictable point**.

## 2. Mutexes and thread safety

In multithreaded code, the most immediate use of deterministic resource management is locking.

### Exception safety in C++

In C++, you don't call `lock()` and `unlock()` manually. If an exception is thrown or the function returns early before reaching `unlock()`, the lock is never released, and every other thread waiting on it hangs forever. Instead, prefer RAII wrappers like **`std::lock_guard`**, **`std::unique_lock`**, or C++17's **`std::scoped_lock`** (the go-to choice when acquiring multiple mutexes at once, as it prevents lock-ordering deadlocks). These tie the lock's lifetime directly to its lexical scope.

### Three dimensions of implementing thread safety

1. **Locking:** Use RAII locks to protect critical sections, and keep lock granularity as small as practical. For read-heavy, write-light workloads, a reader-writer lock (`std::shared_mutex`) is worth considering, though you should benchmark to be sure.
2. **Atomics:** For simple counters and increments, prefer **`std::atomic`**. For lock-free types (which you can verify with `is_always_lock_free`), operations compile down directly to atomic CPU instructions. On x86, for instance, `fetch_add` maps to `LOCK XADD` and `compare_exchange` maps to `LOCK CMPXCHG`. Because threads never go to sleep even when there's contention, atomics perform very well under low contention. Under high contention, however, multiple cores still fight over the same cache line, so the overhead isn't zero. (Note that an uncontended `std::mutex` usually stays in user space too, as with the futex fast path on Linux, and only drops into the kernel to put the thread to sleep when it actually fails to acquire the lock.)
3. **Design:** Eliminate contention by design, using patterns like immutable objects or message passing.

## 3. Correcting some operating-system basics

With thread safety out of the way, it helps to step back and untangle a few OS terms that often get blurred together.

### Process vs. processor

- **Process:** A software concept and the **unit of resource allocation**. It owns an isolated virtual address space (including the heap), along with resources like a PID and open file descriptors.
- **Processor:** A hardware concept meaning the **CPU**. In OS scheduling discussions, it usually refers to a (logical) core capable of running a single thread.

### Thread

The **unit of execution**. Multiple threads within the same process share one address space (the heap, global and static variables, and so on), but each thread has its own stack and register state. Contention between threads comes from this **shared mutable state**. From the OS scheduler's perspective, threads are what actually get scheduled: a process itself never "runs"; the scheduler puts a thread inside that process onto a CPU.

### Concurrency vs. parallelism

- **Concurrency:** The ability to *deal with* many things at once (a property of how work is structured). For instance, a single-core CPU can rapidly context-switch between threads so that multiple tasks appear to make progress at the same time.
- **Parallelism:** The ability to *do* many things at once (physical execution). This requires multiple execution units (most commonly a multi-core processor), so that multiple threads literally compute at the same instant on different cores.

## 4. OOP modeling and design principles (the car-assembly analogy)

Finally, stepping back up to modeling: how we slice objects up and how we wire them together.

- **Encapsulation:** Defines clear **boundaries** of responsibility and maintains **state consistency**. Keep internal state private when the outside world shouldn't touch it, and expose only a deliberate interface (like a steering wheel).
- **Inheritance:** A way to reuse behavior and **interface contracts**, not a shortcut for copy-pasting code.
- **Polymorphism:** Provides a **uniform way to call into different implementations** (decoupling). The caller just invokes `wheel->rotate()` without caring whether the underlying object is a regular tire or an off-road tire.
- **Composition over inheritance:** Prevents class-hierarchy explosion. Treating capabilities as modular, pluggable slots makes the system much easier to change and test. Think of a car chassis with slots for an engine and tires: plug in an electric motor and off-road tires, and you have an electric off-roader.

### Where the design methodologies fit

- **TDD (engineering-oriented):** Starting from the test naturally nudges objects toward high cohesion and loose coupling.
- **BDD (user-oriented):** Starting from user-behavior scenarios keeps what you build anchored to real requirements.
- **DDD (domain-driven):** A way to tackle complex business domains. It uses a **Ubiquitous Language** and **Bounded Contexts** to keep the engineering model aligned with business reality.
