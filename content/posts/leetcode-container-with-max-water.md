---
title: "LeetCode Note: Array Day 1, Container with Max Water"
date: "2025-09-08"
description: "From brute force to two pointers on Container with Max Water, with time and space complexity for each."
tags: ["LeetCode", "Arrays", "Two Pointers"]
published: true
---

雖然是 Day 1，不過其實在這之前我已經陸續刷了幾題不同 topic 的題目，只是今天才剛好想到應該來記錄一下解題思路，所以我們的第一題就是從 array topic medium 的 Container with Max Water 開始啦！

**題目解析:**

我們先來看看題目說了什麼:

> You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

> Find two lines that together with the x-axis form a container, such that the container contains the most water.

> Return *the maximum amount of water a container can store*.

> **Notice** that you may not slant the container.

由此我們能解析，題型給了我們一個有不同 height 的 array ，總共內含 n個垂直高度，並會在每個 height 值對應的 x 軸座標畫出一個從 y 軸 0-height[i] 長度的刻度線。

根據題意，我們需要利用座標軸上的任兩條線組成一個裝水的容器，並以此找出最大容量。

**解題思路:**

一開始暴力解法很直覺的能想到利用兩個迴圈窮舉出每個可能性:

```python
max_area = 0
for i in range(len(height)):
    for j in range(i+1, len(height)):
        max_area = max(max_area, (j - i) * min(height[i], height[j]))
return max_area
```

這個解法的時間複雜度是 O(n²) ，總共跑了兩層迴圈，其中雖然每個迴圈都會用到 max(), min() ，但都是固定長度的比較，屬於常數範疇，所以這邊是為 O(1) ，整體就是 O(n²) * O(1) = O(n²) 。

空間複雜度方面，沒有額外資料結構，所以都是 O(1) 。

這樣的解法效率太差了，我們來觀察一下這個題目的需求和可能優化方向:

1. 首先，題目的容器為任意兩條線圍成，所以我們把容器拆解為左邊界、底、右邊界，底的長度就是兩個座標之間的間距
2. 我們需要找出底長X水高的最大值，底長會變動，因此這裡先假定我需要找最大高
3. 水的特性是水高會隨矮邊的那邊
4. 所以在變動中，如果遇到某一邊比較矮，我們就能知道應該移動矮邊去找更高的可能性

綜合以上幾點，可以想出一個雙指針的解法:先把 left, right pointer 都設置在極端值(獲得最大的底長)，再移動兩邊試圖找出更高的水高 -> 最後兩個指針會在最高高度相遇:

```python
left, right = 0, len(height) - 1
max_area = 0
while left < right:
    max_area = max(max_area, (right - left) * min(height[left], height[right]))
    if height[left] < height[right]:
        left += 1
    else:
        right -= 1
```

這種解法，我們將迴圈縮減到一個，所以時間複雜度是 O(n) 。

空間複雜度由於沒有多餘資料結構，同樣是 O(1) 。

---

*Originally published on [Medium](https://medium.com/@yusaliudesign/leetcode-note-array-day1-container-with-max-water-875186704732).*
