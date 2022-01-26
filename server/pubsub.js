
module.exports = {
    publish: (socket, drinksId) => socket.emit('pushDrinksOrders', { drinksId }) ,
    reservationPublish : (socket) => socket.emit('pushMealsReservation', { isSuccess : true }),
    analyticsPublish : (socket) => socket.emit('pushanalytics', { isSuccess : true })
}