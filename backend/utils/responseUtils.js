// utils/responseUtils.js
function sendExcel(reply, buffer, filename) {
  return reply
    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    .header("Content-Disposition", `attachment; filename=${filename}`)
    .send(buffer);
}

function sendPdf(reply, buffer, filename) {
  return reply
    .header("Content-Type", "application/pdf")
    .header("Content-Disposition", `attachment; filename=${filename}`)
    .send(buffer);
}

module.exports = { sendExcel, sendPdf };
