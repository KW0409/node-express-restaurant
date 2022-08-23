import { encodeHTML } from "./utils.js";

/* 購物車的 func */ //TODO:
const cartUtils = {
  orderURL: "/admin/order",

  // TODO: 之後要改成真正的 fetch API
  addOrderAPI: async (data) => {
    // 確認 try/catch 的寫法有無錯誤
    try {
      const response = await fetch(`${orderURL}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });
      if (!response.ok) {
        console.log("RESP(Add Order) NOT OK!");
        throw new Error(await response.text());
      }
    } catch (err) {
      alert("訂單資料新增失敗！");
      throw err;
    }
  },

  // TODO: 確認從 localStorage 拿資料的方式是否正確
  getLocalCart: () => {
    // TODO: 把 || 後面的東西改成 []
    let data = JSON.parse(localStorage.getItem("cartList")) || [
      {
        image: "/css/lottery_pic/bg.png",
        dishname: "鮮嫩洋芋白丁佐莎莎",
        price: 260,
        amount: 2,
      },
      {
        image: "/css/lottery_pic/bg.png",
        dishname: "輕盈高麗卷湘南",
        price: 280,
        amount: 5,
      },
      {
        image: "/css/lottery_pic/bg.png",
        dishname: "六彩雙茄起司沙拉",
        price: 250,
        amount: 3,
      },
    ];
    return data;
  },

  // TODO: 之後要改成真正更新 localStorage 的資料
  updateLocalCart: (action, targetRow, currentAmount) => {
    let preCartData = cartUtils.getLocalCart();
    let targetDishname = targetRow.querySelector(".dishname").innerText;
    let newCartData;
    if (action === "update") {
      newCartData = preCartData.map((value) => {
        if (value.dishname !== targetDishname) return value;
        value.amount = currentAmount;
        return value;
      });
    } else if (action === "delete") {
      newCartData = preCartData.filter((value) => {
        return value.dishname !== targetDishname;
      });
    }
    return localStorage.setItem("cartList", JSON.stringify(newCartData));
  },

  itemTemplate: (data, totalPrice) => {
    const htmlTemplate = `
      <td class="image">
        <img class="image" src=${encodeHTML(data.image)}>
      </td>
      <td class="dishname">${encodeHTML(data.dishname)}</td>
      <td class="price">${data.price}</td>
      <td class="amount">
        <input class="amount-btn" type="number" value="${data.amount}">
      </td>
      <td class="total-price">${totalPrice}</td>
      <td class="btn-area"><input class="delete-btn" type="button" value="刪除"></td>
      `;
    return htmlTemplate;
  },

  countTemplate: (orderPriceSum) => {
    const htmlTemplate = `
    <td class="order-price-sum" colspan="6">
      總計： $${orderPriceSum}
    </td>
    `;
    return htmlTemplate;
  },

  getContent: (targetArea) => {
    //TODO:
    const tbody = targetArea.querySelector("tbody");
    const dataArr = cartUtils.getLocalCart();
    let orderPriceSum = 0;
    for (let i = 0; i < dataArr.length; i++) {
      const tableRow = document.createElement("tr");
      let itemPriceSum = dataArr[i].price * dataArr[i].amount;
      orderPriceSum += itemPriceSum;
      tableRow.innerHTML = cartUtils.itemTemplate(dataArr[i], itemPriceSum);
      tbody.appendChild(tableRow);
    }
    const tableRow = document.createElement("tr");
    tableRow.innerHTML = cartUtils.countTemplate(orderPriceSum);
    tbody.appendChild(tableRow);
  },

  countItemPriceSum: (currentAmount, targetRow) => {
    let itemPrice = targetRow.querySelector(".price").innerText;
    let itemPriceSum = itemPrice * currentAmount;
    targetRow.querySelector(".total-price").innerText = itemPriceSum;
  },

  countOrderPriceSum: () => {
    let elementArr = document.querySelectorAll(".total-price");
    let orderPriceSum = 0;
    for (const element of elementArr) {
      orderPriceSum += Number(element.innerText);
    }
    document.querySelector(
      ".order-price-sum"
    ).innerText = `總計： $${orderPriceSum}`;
  },

  dataCheck: (inputDomArr, orderDataObj) => {
    for (const input of inputDomArr) {
      let inputValue = input.value.replace(/\s+/g, "");
      if (inputValue === "") {
        alert("帳單資訊尚未填寫完畢(禁止輸入空格)！");
        return false;
      }

      let className = input.className;
      if (className === "phone") {
        let re = /^09\d{8}$/;
        if (!re.test(inputValue)) {
          input.focus();
          alert("請輸入正確的手機號碼！");
          return false;
        }
      } else if (className === "email") {
        let re = /^.+@.+\.com/;
        if (!re.test(inputValue)) {
          input.focus();
          alert("請輸入正確的信箱格式！");
          return false;
        }
      }
      orderDataObj.bill[className] = inputValue;
    }
    return true;
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const cartContentArea = document.querySelector(".data-container > .content");
  cartUtils.getContent(cartContentArea);

  // 購物清單的按鈕功能
  cartContentArea.addEventListener("click", (e) => {
    let targetRow = e.target.closest("tr");

    // 改變商品數量的功能
    // TODO: 功能都完成後確認是否有問題
    if (e.target.classList.contains("amount-btn")) {
      let currentAmount = Number(e.target.value);
      if (currentAmount === 0) {
        cartUtils.updateLocalCart("delete", targetRow);
        targetRow.parentNode.removeChild(targetRow);
      } else {
        cartUtils.updateLocalCart("update", targetRow, currentAmount);
        cartUtils.countItemPriceSum(currentAmount, targetRow);
      }
      cartUtils.countOrderPriceSum();
    }

    // 刪除商品的功能
    // TODO: 功能都完成後確認是否有問題
    if (e.target.classList.contains("delete-btn")) {
      cartUtils.updateLocalCart("delete", targetRow);
      targetRow.parentNode.removeChild(targetRow);
      cartUtils.countOrderPriceSum();
    }
  });

  const billArea = document.querySelector(".bill-container");
  // 帳單資訊下的按鈕功能
  billArea.addEventListener("click", (e) => {
    // 送出訂單的功能
    // TODO: 功能都完成後確認是否有問題
    if (e.target.classList.contains("confirm-btn")) {
      e.preventDefault();
      let cartData = cartUtils.getLocalCart();
      //TODO: 確認如果購物車為空時的錯誤處理是否正確
      if (cartData.length === 0) {
        return alert("您尚未購買任何餐點！");
      }
      let newOrderData = { item: [], bill: {} };
      let inputDomArr = billArea.querySelectorAll(".user-data > input");
      if (cartUtils.dataCheck(inputDomArr, newOrderData)) {
        newOrderData.item = cartData;
        console.log("newOrderData", newOrderData); //TODO:
        let result = confirm(
          "請確認商品及帳單資訊是否無誤，確定要送出訂單嗎？"
        );
        //TODO: 之後可以改成考慮成功 fetch API 後才 remove localStorage
        if (result) cartUtils.addOrderAPI(newOrderData);
        localStorage.removeItem("cartList");
        //TODO: 成功 fetch API 看要把重新導向做在後端還是前端
      }
    }
  });
});
