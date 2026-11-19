---
slug: modern-cpp-raii-determinism-zh
title: 從 Go/Java 轉看現代 C++：RAII、確定性與 thread-safety
description: >-
  從 managed language 的角度整理現代 C++ 的 RAII 與確定性資源管理、mutex 與
  thread-safety、作業系統執行單位，以及 OOP 建模與設計方法論的筆記。
date: '2026-11-19'
tags:
  - C++
  - RAII
  - Concurrency
  - Operating System
  - OOP
published: true
lang: zh
translationKey: modern-cpp-raii-determinism
---

> 本文整理自我約 2026 年 6 月寫在 HackMD 上的筆記。內容整理自與 AI 的學習對話，經我確認與修訂，並去識別化後重新發布。

這篇是我從 Go/Java 這類 managed language 的背景來看現代 C++ 時整理的筆記，依序聊聊：C++ 的確定性資源管理（RAII）、mutex 與 thread-safety、幾個容易混淆的作業系統概念，最後是 OOP 建模與設計方法論。

## 1. 現代 C++ 的核心哲學：確定性（Determinism）

### 與 Managed Language（Go/Java）的本質差異

- **Managed Languages（Go/Java）：** 帶有較厚重的 Runtime 與 **GC（垃圾回收機制）**。GC 屬於**「集權式、非確定性（Non-deterministic）」**的記憶體管理：物件什麼時候被回收由 GC 決定，而不是由程式碼的結構決定。GC 運作時可能帶來 **Stop-The-World (STW)** 暫停（雖然像 Go 這類現代 GC 大部分工作已與程式並行、STW 階段很短，但回收時機依然不由程式碼決定）。在對尾延遲（tail latency）極度敏感的場景（例如高頻交易），這類延遲抖動（Jitter）可能是無法接受的。

- **現代 C++：** 沒有 GC，奉行 **Zero-overhead 原則**（不用的功能不付成本，用到的功能也很難手寫得更好）。它推崇 **RAII（資源獲取即初始化）**，走的是**「分散式、確定性（Deterministic）」**的資源管理。

### RAII 運作原理

把資源（Heap 記憶體、Lock、File descriptor）的生命週期綁在擁有它的物件上。最常見的例子是 Smart Pointer（如 `std::unique_ptr`）：指標物件本體放在 **Stack** 上，一旦執行流離開 Scope，無論是正常結束、提早 return，還是因為例外觸發 Stack Unwinding（前提是例外最終有被捕捉；若未被捕捉，程式會呼叫 `std::terminate`，至於是否先 unwind 則由實作決定），都會觸發**解構子（Destructor）**，在**確定的時間點**釋放 **Heap** 上的資源。

## 2. 互斥鎖（Mutex）與 Thread-Safe

確定性的資源管理放在多執行緒裡，最直接的應用就是鎖。

### C++ 的 Exception Safety

在 C++ 裡不會手動呼叫 `lock()` / `unlock()`，以免中途拋出例外或提早 return 時沒走到 `unlock()`，導致鎖永遠不會被釋放，其他等鎖的執行緒就這麼一路卡死。實務上應優先使用 **`std::lock_guard`**、**`std::unique_lock`**，或 C++17 的 **`std::scoped_lock`**（需要同時鎖多個 mutex 時優先用它，可以避免鎖順序不一致造成的 deadlock）這類 RAII 工具，把鎖的生命週期與程式碼區塊（Scope）綁死。

### Thread-Safe 的三個實作維度

1. **同步機制 (Locking)：** 用 RAII Lock 保護臨界區（Critical Section），並注意縮小鎖的顆粒度。讀多寫少的場景可以考慮讀寫鎖（`std::shared_mutex`），但還是要以實測為準。
2. **原子操作 (Atomic)：** 簡單的數值累加優先用 **`std::atomic`**。對於 lock-free 的型別（可用 `is_always_lock_free` 確認），它直接靠 CPU 的原子指令完成（例如 x86 上 `fetch_add` 對應 `LOCK XADD`、`compare_exchange` 對應 `LOCK CMPXCHG`）。就算發生競爭也不會讓執行緒睡眠等待，低競爭時效能很好；但在高競爭下，多核心仍會搶同一條 cache line，成本並不是零。（順帶一提，`std::mutex` 在沒有競爭時通常也只在 user space 完成，像 Linux 的 futex fast path；只有搶不到鎖時才會進 kernel 讓執行緒睡眠。）
3. **架構設計 (Design)：** 直接從設計上避開競爭，例如採用 Immutable Object 或 Message Passing。

## 3. 作業系統底層概念糾偏

前面談了 thread-safety，這裡回頭把幾個常被混用的作業系統名詞釐清。

### Process (行程) vs. Processor (處理器)

- **Process：** 軟體概念，是**資源分配的單位**（有獨立的虛擬位址空間，其中包含 Heap，還有 PID、開啟的檔案等資源）。
- **Processor：** 硬體概念，指 **CPU**；在 OS 排程的語境下，通常指可以執行一條 Thread 的（邏輯）核心。

### Thread (執行緒)

是**執行的單位**。同一個 Process 裡的多條 Threads 共享同一個位址空間（Heap、全域／靜態變數等），但各自有獨立的 Stack 與暫存器狀態。多執行緒競爭的根源，就是這些**被共享的可變狀態**。對 OS 排程器來說，排程的對象是 Thread：Process 本身不會被「執行」，真正被放上 CPU 跑的是它裡面的 Thread。

### Concurrency (併發) vs. Parallelism (平行)

- **Concurrency：** 同時應付很多事情的能力（架構上的拆分）。例如單核 CPU 透過 Context Switch 快速切換 Thread，讓多個任務「看起來同時在跑」。
- **Parallelism：** 同時做很多事情的能力（物理上的執行）。需要多個執行單元（最常見的就是多核處理器，Multi-core），讓多條 Thread 真正在不同核心上「同時運算」。

## 4. OOP 建模與設計原則（組裝車比喻）

最後回到建模層次：物件該怎麼切、怎麼組。

- **封裝 (Encapsulation)：** 劃定職責的**邊界**並維持**狀態一致性**。把模組內部不想暴露的變數藏起來（Private），只留特定的操作介面（就像方向盤）。
- **繼承 (Inheritance)：** 行為與**介面契約**的複用，而不是單純拿來複製程式碼。
- **多型 (Polymorphism)：** 提供**一致的呼叫方式**（解耦）。主程式只要呼叫 `wheel->rotate()`，不需要知道底下接的是一般胎還是越野胎。
- **組合優於繼承 (Composition over Inheritance)：** 避免類別爆炸。把功能做成模組化的插槽（車殼留好引擎與輪胎的插槽，插上電力馬達＋越野胎就變成電動越野車），能大幅提升系統的彈性與可測試性。

### 設計方法論的定位

- **TDD (工程取向)：** 從測試出發，比較自然地推著物件走向高內聚、好解耦。
- **BDD (用戶取向)：** 從使用者的行為情境出發，確保做出來的東西符合實際需求。
- **DDD (領域驅動)：** 用來應對複雜業務邏輯的方法。透過 **Ubiquitous Language (統一語言)** 與 **Bounded Context (限界上下文)**，讓工程模型與商業現實對齊。
