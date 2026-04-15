---
title: "Sign Key & disassemble tips"
date: "2026-04-15"
description: "Sign key and disassemble tips for mock test android data"
tags: ["Next.js", "SDET"]
published: true
---

## Sign Key

有時候會遇到需要準備APK測資的情況，這時可以使用一個小工具進行，以下步驟是以 macOS 進行：

1. 這個工具需要 java 8 環境執行，所以需要先進行環境建置，首先需下載 [jre-8u351](https://www.oracle.com/tw/java/technologies/javase/javase8u211-later-archive-downloads.html)(可以根據環境使用的 OS 選擇需要的檔案下載)
2. 安裝完後需要先開 vim 過環境，以 macOS 來說，步驟如下：

    1. 下指令進入 edit 模式
    ```bash=
    vim ~/.bash_profile
    # 按 I 進入 --INSERT-- 模式
    ```
    2. 編輯內容:

    ```bash=
    export JAVA_8_HOME=$(/usr/libexec/java_home -v1.8)
    alias java8='export JAVA_HOME=$JAVA_8_HOME'
    default to java 8
    java8
    # 編輯結束後先按 ESC ，再 Shift+: ，輸入 :w (write & quite) 結束
    ```
    3. 過環境
    ```bash=
    source ~/.bash_profile
    ```
    4. 環境處理完後就可以開始使用 [SignApK Tool(signapk.jar)](https://rickbsr.medium.com/%E7%B5%A6%E4%BA%88-android-apk-%E7%B3%BB%E7%B5%B1%E7%B0%BD%E5%90%8D-27b0e157d34d) 進行了

3. 環境處理完後開始使用 SignApk Tool 的流程會是這樣:

 - 基本上我會先把需要重新 Sign Key 的 APK 檔丟進 Tool 資料夾裡(如圖)
    ![](https://hackmd.io/_uploads/SySJSgnO3.png)

 - 使用任何 IDE(VSCode/IntelliJ/Sublime etc.) 打開 README 檔案

    ![](https://hackmd.io/_uploads/Bkf5ren_2.png)
    
    以上圖來說，就會是：
    com_cardboard_wave.apk → 被丟進資料夾裡，需要 sign key 的 source apk
    com_cardboardwithfusesfeature_app.apk → sign 完之後的檔名
- 接下來打開 terminal ， cd 進 SignApk 資料夾路徑，並執行 README 檔裡改完的指令：
    ```bash=
    $ java -jar signapk.jar certificate.pem key.pk8 com_cardboard_wave.apk  com_cardboardwithfusesfeature_app.apk
    ```
    
- 接下來就能在同個資料夾裡看到 Sign 完 Key 的 APK 了


## 組譯 & 反組譯

正規上在 build APK 時，在最後一部會把包含 APKManifest.xml 的專案檔案包成一個 APK 檔，這個行為就叫做 組譯 (assemble) ，反之，把已經包好的 apk 拆開成原本的專案 project folder 的一系列步驟就叫做 反組譯 (disassemble) 。

以這次的例子來說，因為需要弄出比較極端情況的測資，在只考慮到片面欄位的情況下，用 tool 直接改宣告內容再包回去會比較快。但一般情況的話，因為這樣包出來的 apk 在執行上一定會有問題，所以要改宣告還是要走正規流程 build APK。

**事前準備**

首先，要先裝好 [apktool](https://ibotpeaches.github.io/Apktool/) 。

MacOS可以直接使用 brew 安裝

```bash=
$ brew install apktool
```
![](https://hackmd.io/_uploads/BkuWve2On.png)

看到這樣的畫面就代表跑完了

跑完以後，建立一個 folder 用來放預計要拆開的 apk ，以下圖來說的話，就是在Downloads路徑裡開了一個 apkPlayGround

![](https://hackmd.io/_uploads/SJlLcln_h.png)

這邊處理完之後一樣開 terminal 進入下 command 流程:

1. cd 進 apkPlayGround 路徑

    ```bash=
    ~ cd Downloads
    ~ cd apkPlayGround
    ```
2. 執行 apktool 指令，把 apk 拆開
    ```bash=
    ~ apktool d -f <the_apk_file_name>
    ```
3. 拆開以後即可使用 Android Studio 打開被拆回 repo 型態的 apk 檔
    ![](https://hackmd.io/_uploads/B1QElZhO3.png)
    這邊主要就是進AndroidManifest.xml檔，把需要測到的內容改成符合的測資 ex:
    ```kotlin=
   <uses-feature android:name="featureName" android:required="false" />
    // etc...
    ```
4. 改完以後再下指令把 apk 包回去：
    ```bash=
    ~ apktool b <the_apk_file_folder_path> -o <the_target_assembled_apk_file_name>
    ```
    
這樣就完成快速 gen 測資的流程！
然而，需要注意的是，這種非正規方式 gen 出來的 apk 通常是無法執行的，所以只適用於單純測試是否能讀取/parsing特定欄位的情況，正式打包 apk 時還是需要走正規流程 build 檔案
