## API 文件

Base URL: https://kwang.tw/restaurant

#### 使用者 User

| 說明                 | Method | path             | 權限擁有者 |
| -------------------- | ------ | ---------------- | ---------- |
| 註冊使用者           | POST   | /register        | anyone     |
| 登入使用者           | POST   | /login           | anyone     |
| 取得自己的使用者資料 | GET    | /user            | user       |
| 修改自己的使用者資料 | POST   | /user            | user       |
| 修改自己的密碼       | POST   | /update-password | user       |

#### 產品 Product

| 說明         | Method | path             | 權限擁有者 |
| ------------ | ------ | ---------------- | ---------- |
| 取得所有商品 | GET    | /register        | anyone     |
| 修改商品     | POST   | /login           | admin      |
| 新增商品     | POST   | /user            | admin      |
| 刪除商品     | DELETE | /user            | admin      |
| 搜尋商品     | GET    | /update-password | anyone     |

#### 訂單 Order

| 說明         | Method | path             | 權限擁有者  |
| ------------ | ------ | ---------------- | ----------- |
| 取得全部訂單 | GET    | /register        | admin       |
| 成立訂單     | POST   | /user            | user        |
| 取得單一訂單 | GET    | /login           | user, admin |
| 刪除訂單     | GET    | /user            | admin       |
| 接受訂單     | GET    | /update-password | admin       |
| 完成訂單     | GET    | /user            | admin       |
| 修改訂單     | POST   | /update-password | admin       |
| 取得歷史訂單 | GET    | /user            | user, admin |

#### 購物車 Cart

| 說明               | Method | path             | 權限擁有者 |
| ------------------ | ------ | ---------------- | ---------- |
| 取得購物車商品     | GET    | /register        | anyone     |
| 新增商品至購物車   | POST   | /login           | anyone     |
| 編輯購物車商品     | POST   | /user            | user       |
| 刪除購物車商品     | GET    | /user            | user       |
| 刪除購物車全部商品 | GET    | /update-password | user       |

#### 交易明細 Transaction

| 說明                 | Method | path      | 權限擁有者  |
| -------------------- | ------ | --------- | ----------- |
| 取得單筆訂單交易明細 | GET    | /register | user, admin |
| 取得熱門商品         | GET    | /login    | anyone      |
