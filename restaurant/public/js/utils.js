export const documentUtils = {
  tableTemplate: `
  <table>
    <thead></thead>
    <tbody></tbody>
  </table>
  `,

  // 讓表格添加新增按鈕
  getTableAddBtn: (newTabContent) => {
    const addBtn = document.createElement("input");
    addBtn.classList.add("add-btn");
    addBtn.setAttribute("type", "button");
    addBtn.setAttribute("value", "新增");
    newTabContent.appendChild(addBtn);
  },

  // 塞入表格的標題
  getTableTitle: (newTabContent, titleArr) => {
    const thead = newTabContent.querySelector("thead");
    const theadRow = document.createElement("tr");
    for (let i = 0; i < titleArr.length; i++) {
      const tableTitle = document.createElement("th");
      tableTitle.innerText = titleArr[i];
      theadRow.appendChild(tableTitle);
    }
    thead.appendChild(theadRow);
  },

  // 塞入頁籤的內容
  getTabContent: (targetTabUtils, newTabContent) => {
    if (targetTabUtils.tableTitleArr) {
      newTabContent.innerHTML = documentUtils.tableTemplate;
      let titleArr = targetTabUtils.tableTitleArr;
      documentUtils.getTableTitle(newTabContent, titleArr);
    }
    targetTabUtils.getContent(newTabContent);
  },

  // 表格自動排序功能
  tableArrange: (targetTabContent) => {
    const tbody = targetTabContent.querySelector("tbody");
    const trNodeList = targetTabContent.querySelectorAll("tbody tr");
    const trArrList = [];
    for (let i = 0; i < trNodeList.length; i++) {
      // selectorAll 抓到的 trNodeList 不是真正的 arr，因此要先變成一個真正的 arr 才能操作
      trArrList.push(trNodeList[i]);
    }

    const newArrDOM = [];
    const { length } = trArrList;
    for (let i = 0; i < length; i++) {
      let minNum = Number(
        trArrList[0].querySelector(".sequence.origin").innerText
      );
      let minNumIndex = 0;
      for (let j = 1; j < trArrList.length; j++) {
        const currentNum = Number(
          trArrList[j].querySelector(".sequence.origin").innerText
        );
        if (currentNum < minNum) {
          minNum = currentNum;
          minNumIndex = j;
        }
      }
      newArrDOM.push(trArrList[minNumIndex]);
      trArrList.splice(minNumIndex, 1);
    }

    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }
    for (let i = 0; i < newArrDOM.length; i++) {
      tbody.appendChild(newArrDOM[i]);
    }
  },

  // 檢查表格欄位值(是否有空值＆機率總和)功能
  dataCheck: (targetRow, classNameArr, dataObj) => {
    for (const className of classNameArr) {
      let altInputValue = targetRow.querySelector(
        `.${className} .alt__text`
      ).value;
      // 判斷是否有空值
      if (altInputValue === "") {
        return alert("表格欄位不可以有空白！");
      }
      dataObj[className] = altInputValue;
    }

    const percentageList = document.querySelectorAll(".percentage .alt__text");
    if (percentageList.length) {
      let percentageSum = 0;
      for (const percentage of percentageList) {
        percentageSum += Number(percentage.value);
      }
      if (percentageSum > 100) {
        // 限定不可超過 100% 即可，不然會無法改動表格
        return alert(`機率總和不可超過 100%！目前機率： ${percentageSum} %`);
      }
    }
    return true;
  },

  // 編輯表格or取消編輯表格功能
  dataUpdate: (target, action) => {
    const originContents = target.querySelectorAll(".origin");
    const altInput = target.querySelectorAll(".alt");

    for (let i = 0; i < originContents.length; i++) {
      if (action === "update") {
        originContents[i].classList.add("hide");
        altInput[i].classList.remove("hide");
      } else if (action === "cancel") {
        originContents[i].classList.remove("hide");
        altInput[i].classList.add("hide");
      }
    }
  },

  // 儲存表格功能
  // TODO: 各頁籤功能完成後，確認跟 dataStoreUser() 的差別
  dataStoreAdmin: async (
    target,
    targetTabContentId,
    targetTabUtils,
    classNameArr
  ) => {
    const data = { id: target.querySelector("input.id").value };
    const dataCheckPass = documentUtils.dataCheck(target, classNameArr, data);
    if (!dataCheckPass) {
      // 如果通過 documentUtils.dataCheck 會回傳 true，反之直接 return
      return;
    }

    const targetTabContent = target.closest(
      `.tab-content#${targetTabContentId}`
    );
    try {
      await targetTabUtils.updateAPI(data.id, data);
      target.innerHTML = targetTabUtils.template(data);
      documentUtils.tableArrange(targetTabContent);
    } catch (err) {
      console.log(err);
    }
  },

  // 儲存表格功能
  // TODO: 各頁籤功能完成後，確認跟 dataStoreAdmin() 的差別
  dataStoreUser: async (
    target,
    defaultData,
    classNameArr,
    targetTabUtils,
    needArrange
  ) => {
    const data = defaultData || {
      id: target.querySelector("input.id").value,
    };

    for (const className of classNameArr) {
      data[className] = target.querySelector(`.${className} .alt__text`).value;
    }

    try {
      await targetTabUtils.updateAPI(data);
      target.innerHTML = targetTabUtils.template(data);
      if (needArrange) {
        const targetTabContent = target.closest(
          `.tab-content#${targetTabContentId}`
        );
        documentUtils.tableArrange(targetTabContent);
      }
    } catch (err) {
      console.log(err);
      // TODO: 確認錯誤之後要做什麼動作
      // target.innerHTML = targetTabUtils.template(data);
    }
  },

  // 確認是否要刪除表格欄位功能(只是單純確認是否要刪除表格欄位，確認後才去呼叫刪除欄位和資料庫的資料的動作)
  tableRowDelete: (e, targetTabUtils) => {
    const targetRow = e.target.closest("tr");
    const firstCheckBtn = targetRow.querySelector(".first__check-btn");
    const doubleCheckBtn = targetRow.querySelector(".double__check-btn");
    if (e.target.classList.contains("delete__first-btn")) {
      firstCheckBtn.classList.add("hide");
      doubleCheckBtn.classList.remove("hide");
    } else if (e.target.classList.contains("delete__cancel-btn")) {
      firstCheckBtn.classList.remove("hide");
      doubleCheckBtn.classList.add("hide");
    } else if (e.target.classList.contains("delete__check-btn")) {
      const id = targetRow.querySelector("input.id").value;
      documentUtils.dataDelete(targetTabUtils, targetRow, id);
    }
  },

  // 刪除表格資料功能(把刪除的欄位 fetch delete 到資料庫)
  // TODO: 待資料庫建好後確認使用上有無問題
  dataDelete: async (targetTabUtils, targetRow, id) => {
    try {
      await targetTabUtils.deleteAPI(id);
      targetRow.parentNode.removeChild(targetRow);
    } catch (err) {
      console.log(err);
    }
  },

  // 新增表格欄位功能(只是單純新增表格欄位，還沒有新增到資料庫)
  tableRowAdd: (e, targetTabUtils, classNameArr) => {
    const newRow = document.createElement("tr");
    const data = { id: "0" };
    for (const className of classNameArr) {
      data[className] = "";
    }
    newRow.innerHTML = targetTabUtils.template(data);

    const targetTabTbody = e.target.parentNode.querySelector("tbody");
    targetTabTbody.appendChild(newRow);
    newRow.querySelector(".handle__store-btn").classList.add("hide");
    newRow.querySelector(".handle__add-btn").classList.remove("hide");
    newRow.querySelector(".update-btn").click();
  },

  // 新增表格資料功能(把新增的欄位 fetch add 到資料庫)
  // TODO: 待資料庫建好後確認使用上有無問題
  dataAdd: async (e, targetTabContentId, targetTabUtils, classNameArr) => {
    const targetRow = e.target.closest("tr");
    if (e.target.classList.contains("add__cancel-btn")) {
      targetRow.parentNode.removeChild(targetRow);
      return;
    }

    const data = {};
    const dataCheckPass = documentUtils.dataCheck(
      targetRow,
      classNameArr,
      data
    );
    if (!dataCheckPass) return;

    const targetTabContent = targetRow.closest(
      `.tab-content#${targetTabContentId}`
    );
    try {
      data.id = await targetTabUtils.addAPI(data);
      targetRow.innerHTML = targetTabUtils.template(data);
      documentUtils.tableArrange(targetTabContent);
    } catch (err) {
      console.log(err);
    }
  },
};

export function encodeHTML(str) {
  // 對 number type 的值做 encodeHTML 會出錯
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");
}
