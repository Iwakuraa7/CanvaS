class Circle {
    constructor(xPos, yPos, radius, color, lineWidth) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.radius = radius;
        this.color = color;
        this.lineWidth = lineWidth;
        this.fillColor = null;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.xPos, this.yPos, this.radius, 0, 2 * Math.PI);
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        if (this.fillColor) {
            context.fillStyle = this.fillColor;
            context.fill();
        }
        context.stroke();
    }

    isShapeClicked(xMouse, yMouse) {
        const distance = Math.sqrt(((xMouse - this.xPos) * (xMouse - this.xPos)) + ((yMouse - this.yPos) * (yMouse - this.yPos)));
        return distance <= this.radius;
    }
}

class Line {
    constructor(points, color, lineWidth) {
        this.points = points || [];
        this.color = color;
        this.lineWidth = lineWidth;
    }

    draw(context) {
        if (this.points.length < 2) return;
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            context.lineTo(this.points[i].x, this.points[i].y)
        }
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
    }

    isShapeClicked(xMouse, yMouse) {
        return false;
    }
}

class Rectangle {
    constructor(xPos, yPos, width, height, color, lineWidth) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.width = width;
        this.height = height;
        this.color = color;
        this.lineWidth = lineWidth;
        this.fillColor = null;
    }

    draw(context) {
        context.beginPath();
        context.rect(this.xPos, this.yPos, this.width, this.height);
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        if (this.fillColor) {
            context.fillStyle = this.fillColor;
            context.fill();
        }
        context.stroke();
    }

    isShapeClicked(xMouse, yMouse) {
        return xMouse >= this.xPos && xMouse <= this.xPos + this.width && yMouse >= this.yPos && yMouse <= this.yPos + this.height;
    }
}

function updateCanvas(context, shapes, img) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (img.src) {
        context.drawImage(img, 0, 0);
    }
    shapes.forEach((shape) => shape.draw(context));
}

document.addEventListener('DOMContentLoaded', () => {
    const canvasDefaultBackground = "white";
    let isCircleBtn = false;
    let isLineBtn = false;
    let isRectBtn = false;
    let isFillBtn = false;
    let isDrawing = false;
    let prevX;
    let prevY;
    let shapes = [];
    let currentShape = null;

    const thicknessRange = document.querySelector('#thickness-range');
    let thicknessValue = thicknessRange.value;
    const colorPicker = document.querySelector('#color');
    let currentColor = "black";

    const userId = document.querySelector('#account').getAttribute('data-user-id');
    const editUrlElement = document.querySelector('#edit_url');
    const editUrl = editUrlElement.innerText;
    const editId = parseInt(document.querySelector('#edit_id').innerText);
    console.log(editId)

    // Canvas settings
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d');
    canvas.height = 700;
    canvas.width = 1000;
    canvas.style.background = canvasDefaultBackground;

    // Edit logic
    let img = new Image()
    img.src = editUrl;
    if(editUrl) {
        img.onload = () => {
            context.drawImage(img, 0, 0);
        }
    }
    else {
        console.log('Failed to load the edit drawing or default page.')
    }

    // Buttons
    const downloadBtn = document.querySelector('#download');
    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = 'image.png';
        link.href = canvas.toDataURL();
        link.click();
        link.delete();
    }
    const circleBtn = document.querySelector('#circle-activate-button')
    circleBtn.onclick = () => {
        isLineBtn = false;
        isRectBtn = false;
        isFillBtn = false;
        isCircleBtn = !isCircleBtn;
    }
    const lineBtn = document.querySelector('#line-activate-button');
    lineBtn.onclick = () => {
        isCircleBtn = false;
        isRectBtn = false;
        isFillBtn = false;
        isLineBtn = !isLineBtn
    }
    const rectBtn = document.querySelector('#rect-activate-button');
    rectBtn.onclick = () => {
        isCircleBtn = false;
        isLineBtn = false;
        isFillBtn = false;
        isRectBtn = !isRectBtn
    }
    const clearBtn = document.querySelector('#clear');
    clearBtn.onclick = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        shapes = [];
        img.src = '';
        canvas.style.background = canvasDefaultBackground;
    }
    document.querySelector('#undo').onclick = () => {
        shapes.pop();
        updateCanvas(context, shapes, img);
    }
    document.querySelector('#fill').onclick = () => {
        isCircleBtn = false;
        isLineBtn = false;
        isRectBtn = false;
        isFillBtn = true;
    }

    const saveBtn = document.querySelector('#save')
    saveBtn.onclick = () => {
        fetch(`/save_drawing`, {
            method: isNaN(editId) ? "POST" : "PUT",
            body: JSON.stringify({
                edit_drawing_id: editId,
                drawing_url: canvas.toDataURL()
            })
        })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    document.querySelector('#msgs').innerText = 'Saved';
                }
                else if(data.error) {
                    console.log(`${data.error}`);
                }
            })
    }

    // Events
    canvas.addEventListener('mousedown', (event) => {
        const canvasInfo = canvas.getBoundingClientRect();
        const x = event.clientX - canvasInfo.left;
        const y = event.clientY - canvasInfo.top;

        if(isLineBtn) {
            isDrawing = true;
            currentShape = new Line([{x, y}], currentColor, thicknessValue)
        }
        if(isCircleBtn) {
            context.beginPath();
            prevX = x;
            prevY = y;
            isDrawing = true;
        }
        if(isRectBtn) {
            context.beginPath();
            prevX = x;
            prevY = y;
            isDrawing = true;
        }
    })

    canvas.addEventListener('mouseup', () => {
        if(isLineBtn) {
            isDrawing = false;
            if (currentShape) {
                shapes.push(currentShape);
                currentShape = null;
            }
        }
        else if(isCircleBtn) {
            if(currentShape) {
                shapes.push(currentShape)
                isDrawing = false;
                context.closePath();
                currentShape = null;
            }
        }
        else if(isRectBtn) {
            if(currentShape) {
                shapes.push(currentShape)
                isDrawing = false;
                context.closePath();
                currentShape = null;
            }
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        const canvasInfo = canvas.getBoundingClientRect();
        const x = event.clientX - canvasInfo.left;
        const y = event.clientY - canvasInfo.top;
        if(isDrawing && isLineBtn) {
            currentShape.points.push({x, y});
            updateCanvas(context, shapes, img);
            currentShape.draw(context)
        }
        if(isDrawing && isCircleBtn) {
            const radius = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
            updateCanvas(context, shapes, img);
            currentShape = new Circle(prevX, prevY, radius, currentColor, thicknessValue);
            currentShape.draw(context);
        }
        if(isDrawing && isRectBtn) {
            const width = x - prevX;
            const height = y - prevY;
            updateCanvas(context, shapes, img);
            currentShape = new Rectangle(prevX, prevY, width, height, currentColor, thicknessValue);
            currentShape.draw(context);
        }
    });

    // To prevent from drawing lines when mouse is out of the canvas
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        if(currentShape) {
            shapes.push(currentShape);
            currentShape = null;
        }
    })

    // Fill logic
    canvas.addEventListener('click', (event) => {
        if (isFillBtn) {
            const canvasInfo = canvas.getBoundingClientRect();
            const x = event.clientX - canvasInfo.left;
            const y = event.clientY - canvasInfo.top;

            for (let i = 0; i < shapes.length; i++) {
                if (shapes[i].isShapeClicked(x, y)) {
                    shapes[i].fillColor = currentColor;
                    updateCanvas(context, shapes, img); // Redraw the canvas after filling the shape
                    return;
                }
            }

            canvas.style.background = currentColor;
        }
    });


    // Brush width and color logic
    thicknessRange.addEventListener('input', (event) => {
        thicknessValue = event.target.value;
    })

    colorPicker.addEventListener('input', (event) => {
        currentColor = event.target.value;
    })
});