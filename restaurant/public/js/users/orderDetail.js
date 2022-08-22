const orderURL = "/admin/order";
// TODO: 之後要改成真正的 fetch API
async function updateOrderAPI(data) {
  const id = window.location.pathname.split("/")[3];

  // 確認 try/catch 的寫法有無錯誤
  try {
    const response = await fetch(`${orderURL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
    if (!response.ok) {
      console.log("RESP(UPDATE) NOT OK!");
      throw new Error(await response.text());
    }
  } catch (err) {
    alert("訂單資料編輯失敗！");
    throw err;
  }
}

const btnArea = document.querySelector(".btn__area");

async function btnAction(action, data) {
  const orderState = document.querySelector(".order-state");
  try {
    // TODO: 之後要真正有去 fetch 的功能
    // await updateOrderAPI(data);
    orderState.innerHTML = `訂單狀態：${data}`;

    if (action === "ready") {
      let originBtn = btnArea.querySelector(".origin");
      let altBtn = btnArea.querySelector(".alt");
      btnArea.removeChild(originBtn);
      altBtn.classList.remove("hide");
    } else {
      if (action === "cancel") {
        orderState.classList.add("cancel-state");
      }
      btnArea.parentNode.removeChild(btnArea);
    }
  } catch (err) {
    console.log(`orderDetail Err(${action}-btn):`, err);
  }
}

btnArea.addEventListener("click", (e) => {
  // 可領取按鈕功能
  if (e.target.classList.contains("ready-btn")) {
    btnAction("ready", "可領取");
  }

  // 完成訂單按鈕功能
  if (e.target.classList.contains("complete-btn")) {
    btnAction("complete", "已完成");
  }

  // 取消訂單按鈕功能
  if (e.target.classList.contains("cancel-btn")) {
    btnAction("cancel", "已取消");
  }
});
