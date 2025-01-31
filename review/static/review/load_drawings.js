document.addEventListener('DOMContentLoaded', () => {
    const userId = document.querySelector('#account').getAttribute('data-user-id');

    fetch(`get_drawings_${userId}`)
        .then(response => response.json())
        .then(user => {
            const userDrawingsElement = document.querySelector('#user-drawings');
            const userDrawingsObjects = user.drawings;
            userDrawingsObjects.forEach(drawing => {
                const dataURL = drawing.url;
                const img = new Image();
                img.src = dataURL;
                img.style.border = "1px #aaaa dotted";
                img.style.height = "350px";
                img.style.width = "500px";
                img.style.margin = "1%";
                const anchor = document.createElement('a');
                anchor.append(img);
                anchor.href = `edit/${drawing.id}`
                userDrawingsElement.prepend(anchor);
            })
        })
})