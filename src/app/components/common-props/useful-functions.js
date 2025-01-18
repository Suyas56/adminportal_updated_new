export const fileUploader = async (attachment) => {
    let file = new FormData()
    file.append('files', attachment.url)
    // console.log(file.get("files"));
    let viewLink = await fetch('/api/upload', {
        method: 'POST',
        body: file,
    })
    return viewLink.url
}
