export const dateformatter = (date) => {
    var format_date = new Date(date)
    var dd = format_date.getDate()

    var mm = format_date.getMonth() + 1
    var yyyy = format_date.getFullYear()
    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }
    return yyyy + '-' + mm + '-' + dd
}
