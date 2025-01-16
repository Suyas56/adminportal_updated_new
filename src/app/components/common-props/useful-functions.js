export const fileUploader = async (attachment) => {
    let file = new FormData()
    file.append('files', attachment.url)
    // console.log(file.get("files"));
    let viewLink = await fetch('/api/gdrive/uploadfiles', {
        method: 'POST',
        body: file,
    })
    viewLink = await viewLink.json()
    // console.log("Client side link");
    // console.log(viewLink);
    return viewLink[0]?.webViewLink
}
