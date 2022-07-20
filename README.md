# Just A Bite

這是一個使用 Express + Sequelize 框架，為咬一口餐廳 Just A Bite 所打造的簡單線上點餐網站及管理後台。<br>
使用者分為一般消費者和店家管理員，消費者可在前台網站享受流暢的訂餐體驗、管理個人資料及查看訂單紀錄，而管理員則可以在後台針對「會員」、「商品」和「訂單」三大區塊進行管理。

> 網站連結：[Just A Bite](123)

> 使用者測試帳密：user00/User00
> 後台測試帳密：admin00/Admin00

![餐廳網站截圖](https://i.imgur.com/znJvjej.png "餐廳網站截圖")

## 目錄

- [功能描述](#功能描述)
- [檔案架構](#檔案架構)
- [使用技術](#使用技術)
- [API 文件](#API文件)

## 功能描述

- 前台功能（For 使用者）
  - 登入/註冊系統：
    - 表單驗證功能，若輸入格式或資料不符將無法登入/註冊
      <br>
  - 會員系統：
    - 查看、編輯個人資料
    - 查看目前訂單及歷史訂單的最新狀態
    - 查看訂單商品數量、金額及訂單總額
      <br>
  - 商品系統：
    - 瀏覽商品、搜尋商品並點進商品頁面查看詳細資料
    - 一鍵將商品加入購物車，也可進入商品詳細頁面調整要購買的數量
    - 若商品不在架上或數量不足，商品圖片會拉灰並顯示已售完
    - 若商品超出庫存數量，會提示使用者商品庫存不足
      <br>
  - 購物車系統：
    - icon 同步顯示購物車商品數量
    - 查看、修改購物車明細
    - 查看欲購買的項目及內容，並且成立訂單
      <br>
  - 結帳系統：
    - 提供在線上付款的功能
      <br>
  - 常見問題系統：
    - 查看常見問題列表
      <br>
- 後台功能（For 店家）
  - 會員管理系統：
    - 查看會員列表 (含搜尋功能)
    - 查看會員詳細資料與歷史訂單
      <br>
  - 常見問題系統：
    - 查看常見問題列表
    - 新增、修改、刪除商品常見問題及其資訊
      <br>
  - 商品管理系統：
    - 查看商品列表 (含搜尋功能)
    - 新增、修改、刪除商品及其資訊
      <br>
  - 訂單管理系統：
    - 查看訂單列表 (含搜尋功能)
    - 檢視訂單詳細資訊
    - 管理訂單狀態
      <br>

## 檔案架構

```
├── config
│   └── config.json
├── controllers
│   ├── carts.js
│   ├── discounts.js
│   ├── orders.js
│   ├── products.js
│   ├── transactions.js
│   └── users.js
├── index.js
├── middleware
│   └── auth.js
├── migrations
├── models
│   ├── cart_item.js
│   ├── discount.js
│   ├── index.js
│   ├── order.js
│   ├── product.js
│   ├── transaction.js
│   └── user.js
├── node_modules
├── package.json
├── package-lock.json
├── README.md
└── seeders
```

## 使用技術

- Express
- Sequelize-cli
- MySQL
- Bootstrap
- AWS EC2
- FileZilla
- Nginx
- PM2

## API 文件 {#API 文件}

- [API 文件](./api_docs.md)
