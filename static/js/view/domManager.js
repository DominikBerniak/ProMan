export let domManager = {
  addChild(parentIdentifier, childContent) {
    const parent = document.querySelector(parentIdentifier);
    if (parent) {
      parent.insertAdjacentHTML("beforeend", childContent);
    } else {
      console.error("could not find such html element: " + parentIdentifier);
    }
  },
  addEventListener(parentIdentifier, eventType, eventHandler) {
    const parent = document.querySelector(parentIdentifier);
    if (parent) {
      parent.addEventListener(eventType, eventHandler);
    } else {
      console.error("could not find such html element: " + parentIdentifier);
    }
  },
  displayAlertModal(modalBodyContent) {
    let modalBody = document.querySelector('#alertModal .modal-body')
    modalBody.innerHTML = `
    <p> ${modalBodyContent} </p>`
    $('#alertModal').modal();
},

  displayConfirmModal(modalBodyContent) {
    let modalTitle = document.querySelector('#confirmModal .modal-title')
    let modalBody = document.querySelector('#confirmModal .modal-body')
    modalTitle.innerHTML = 'Confirm changes'
    modalBody.innerHTML = `
    <p> ${modalBodyContent} </p>`
    $('#confirmModal').modal();
  }
};
