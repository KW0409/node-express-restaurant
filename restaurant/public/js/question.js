
// 選取 Q1~6 的父元素來做事件代理
const faqWrapper = document.querySelector('.wrapper.faq__wrapper')

// 事件代理及展開收合 Q1~6 內容的功能
faqWrapper.addEventListener('click', (e) => {
  if (e.target.parentNode.classList.contains('read-more')) {
    const element = e.target.parentNode.querySelector('.stretch-text')
    element.classList.toggle('hide')
  } else if (e.target.parentNode.parentNode.classList.contains('read-more')) {
    const element = e.target.parentNode.parentNode.querySelector('.stretch-text')
    element.classList.toggle('hide')
  }
})
