if (window.addEventListener) {
  window.addEventListener("message", receiveMessage, false);
} else if (window.attachEvent) {
  window.attachEvent("onmessage", receiveMessage);
}

function receiveMessage(event) {
  const { action } = event.data;
  const messageData = event.data;

  switch (action) {
    case "setFieldValue":
      const fieldId = String(messageData.fieldId),
        fieldValue = messageData.fieldValue;

      window.loader
        .getDOMAbstractionLayer()
        .setControlValueById(fieldId, fieldValue);
      break;

    default:
      console.warn("Action not implemented");
      break;
  }
}
