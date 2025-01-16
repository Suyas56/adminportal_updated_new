export const getPdfUrl = (url) => {
    if (url.includes('drive.google.com')) {
        var id = url.split('id=')[1].split('&')[0]
        return `https://drive.google.com/file/d/${id}/preview`
    } else {
        return url
    }
}
