---
title: "LeetCode Note: Array Day 2, 3SUM"
date: "2026-04-15"
description: "Three ways to solve 3SUM, from brute force to a hash set to sorted two pointers, with how each one handles duplicate triplets."
tags: ["LeetCode", "Arrays", "Two Pointers", "Hash Set"]
published: true
source: "HackMD note, pasted into the publishing session"
---

## 題目解析:

我們一樣先來看看題目說了什麼:

```
Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.
```

我們先來分析 input 以及 output:

```
input -> nums: List[int]
output -> res: List[List[int]]
```

這次的題目比較直接了當，一開始就點明題目會給予一個 int array，最後也會 return 一個包含所有能達成目標組合的 array，因為用 python 解題，我們這裡都直接設為 list!

至於題目要求的是什麼呢?

```
such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0

.....

Notice that the solution set must not contain duplicate triplets.
```

從這邊可看出我們的目標是找出三個相加為0的數值，並把數組記錄下來，要注意的是重複的組合需要去除。

解題思路:

同樣這個題目能用暴力法解題:套三個迴圈找出所有組合後再比對，這樣時間複雜度就會是 O(n³)

空間複雜度是 O(1) (題目沒有要求把 res 的空間列入考量，在整個執行過程中沒有開到多餘的空間)

來思考一下可以怎麼優化:

- HashSet+2 nested loop

看到這個題目會想到2sum，當時也有一個利用hashMap+單loop的解。

基於這個解法我們需要做點變化，一開始先開一個 set() 來存 res (使用 set 主要是用來去重)

```python
    res = set()
```

一開始我確實思考過是否也能夠仿照 2sum 解，用 hashMap 來存所有nums[i]+nums[j]的結果，但發現這麼做的話:

```python
pair_sum = {}  # key: nums[i]+nums[j], value: list of (i, j)
for i in range(n):
    for j in range(i+1, n):
        s = nums[i] + nums[j]
        pair_sum.setdefault(s, []).append((i, j))
```

空間複雜度上，所有 pair 的組合我們可以視為 C(n,2) ，也就是 n!/2!(n-2)! = n(n-1)/2

算起來我們會需要存入 n(n-1)/2 個組合，也就是 O(n^2)，爆掉了。

再加上題目要求不重複，我們需要去重，這麼做的話會造成重複存入可被視為同樣組合的三元組。

```python
#e.g. duplicated triplets

nums = [-1, 0, 1, 2, -1]

#-> same result

[-1, 0, 1]
[0, -1, 1]
[1, 0, -1]

```

因此這裡都會需要使用 sorted 以及 set() 來進行去重：

```python
res = set()
triplet = tuple(sorted([nums[i], nums[j], target]))

res.add(triplet)
```

所以我們的思路應該變成：不預存所有 pair，而是固定兩個數，用 HashSet 即時查第三個數存不存在。

```python
# hashset with tuple sorting
def threeSum(nums):
    res = set()
    n = len(nums)
    
    for i in range(n):
        seen = set()
        for j in range(i+1, n):
            target = -(nums[i] + nums[j])
            if target in seen:
                triplet = tuple(sorted([nums[i], nums[j], target]))
                res.add(triplet)
            seen.add(nums[j])
    
    return [list(t) for t in res]

#e.g.
# nums = [-1, 0, 1, 2, -1]

# i = -1
# seen set()
# seen {0}
# triplet (-1, 0, 1)
# seen {0, 1}
# seen {0, 1, 2}
# triplet (-1, -1, 2)

# i = 0
# seen set()
# seen {1}
# seen {1, 2}
# triplet (-1, 0, 1)

# i = 1
# seen set()
# seen {2}

# i = 2
# seen set()
# [[-1, -1, 2], [-1, 0, 1]]

```

複雜度分析：

- 時間：O(n²)，雙層 loop
- 空間：O(n)，每輪 i 的 seen set 最多存 n 個元素，加上 res 用 set 去重

- 2 pointer

2 pointer 思路就是把 sorting 做在前，先讓 array 變得有序，再固定第一個數，後面前後夾擊找出總和和目前外層 loop 輪到的 index 能相抵的數

因為已經排列過，不需要再另外處理去重，我們可以直接設置 res 為 list

```python
nums.sort()
res = []
n = len(nums) # find the length of the list
```

接下來先剪枝篩除可以跳過的條件：

1. 最小數已確認 > 0 (總相加怎麼加都不可能抵銷)
2. 外層 loop 和上一個 index 相同的值 (等於在找同樣的解答)
3. 內層 loop 進行中 (left<right) ，但 left point 和上一個 index 值相同 ( 等於在找同樣的解答 )
4. 內層 loop 進行中 (left<right) ，但 right point 和上一個 index 值相同 ( 等於在找同樣的解答 )

整體就會像以下例子：

```python
def threeSum(nums):
    nums.sort()
    res = []
    n = len(nums)

    for i in range(n):
        # impossible to get 0 sum if the smallest elment > 0
        if nums[i] > 0:
            break
        # skip the repetitive outer loop index
        if i > 0 and nums[i] == nums[i-1]:
            continue

        left, right = i+1, n-1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                res.append([nums[i], nums[left], nums[right]])
                # skip the repetitive left and right pointer
                while left < right and nums[left] == nums[left+1]:
                    left += 1
                while left < right and nums[right] == nums[right-1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1

    return res

```

複雜度分析：

- 時間：O(n log n)（ 最一開始的 sort）+ O(n²)（2 pointer）= O(n²)
- 空間：O(1)（排序 in-place，res 不算）；嚴格來說 Python 的 `list.sort()` 是 Timsort，最差情況會用到 O(n) 的額外暫存空間，若不計排序本身的開銷則為 O(1)

不需要額外準備空間來暫存目前看過的值，在不計排序開銷的前提下，成功把空間複雜度壓平到 O(1)
