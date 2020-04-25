if (typeof preload == "function") {preload()}
let windowWidth, windowHeight;
let updateInterval;
let display;
let Scene = [];
document.html = document.querySelector("html");
window.onload = function() {
    // Setup windowWidth, windowHeight
    document.body.onresize = function() {
        windowWidth = display.width = window.innerWidth;
        windowHeight = display.height = window.innerHeight;
    };

    // Create Display
    document.body.style.margin = 0;
    document.html.style.overflowY = "hidden";
    display = Object.assign(document.createElement("canvas"), {
        id: "mainDisplay",
        width: windowWidth,
        height: windowHeight
    });
    document.body.appendChild(display);
    windowWidth = display.width = window.innerWidth;
    windowHeight = display.height = window.innerHeight;
    display.camera = null;
    
    // Function Setup

    if (typeof setup == "function") {setup()}
    updateInterval = setInterval(function() {
        preUpdate();
        if (typeof update == "function") {update()}
        postUpdate();
    }, 1000 / 60);
}
class GameObject {
    constructor(v, c) {
        this.transform = new Transform(v);
        this.components = [];
        if (arguments.length > 1) {
            for(let i = 1; i < arguments.length; i++) {
                let temp = arguments[i];
                if (temp.constructor.requiresParent) {
                    temp.parent = this;
                }
                this.components.push(temp);
            }
        }
        Scene.push(this);
    }
    addComponents() {
        for(let i = 0; i < arguments.length; i++) {
            let checks = 0;
            for(let j = 0; j < this.components.length; j++) {
                if (arguments[i].constructor.name == this.components[j].constructor.name) {
                    checks++;
                }
            }
            if (checks == 0) {
                let temp = arguments[i];
                if (temp.constructor.requiresParent) {
                    temp.parent = this;
                }
                this.components.push(temp);

            }else{
                console.log(arguments[i].constructor.name + " already exists in GameObject");
            }
        }
    }
    setComponents(c) {
        this.components = [];
        for(let i = 0; i < arguments.length; i++) {
            let temp = arguments[i];
            if (temp.constructor.requiresParent) {
                temp.parent = this;
            }
            this.components.push(temp);
        }
    }
    getComponent(s) {
        for(let j = 0; j < this.components.length; j++) {
            if (this.components[j].constructor.name == s) {
                return this.components[j];
            }
        }
        return null;
    }
    getComponentID(s) {
        for(let j = 0; j < this.components.length; j++) {
            if (this.components[j].constructor.name == s) {
                return j;
            }
        }
        return -1;
    }
}
class Transform {
    constructor(v) {
        this.position = v;
        this.rotation = 0;
        this.scale = new Vector2(1, 1);
    }
}
class Renderer {
    static requiresParent = false;
    constructor(data) {
        if (arguments.length == 3) {
            let hex = "#";
            hex += arguments[0].toString(16).length == 1 ? "0" + arguments[0].toString(16) : arguments[0].toString(16);
            hex += arguments[1].toString(16).length == 1 ? "0" + arguments[1].toString(16) : arguments[1].toString(16);
            hex += arguments[2].toString(16).length == 1 ? "0" + arguments[2].toString(16) : arguments[2].toString(16);
            this.data = hex;
            this.dataType = "color";
        }else if (validURL(data)) {
            let tempImg = document.createElement("img");
            tempImg.src = data;
            this.data = tempImg;
            this.dataType = "image";
        }else if (typeof data == "string") {
            this.data = data;
            this.dataType = "color";
        }else{
            this.data = null;
            this.dataType = "undefined";
            console.log(data.toString() + " is not a valid render type");
        }
        this.enabled = true;
    }
    setType(data) {
        if (validURL(data)) {
            let tempImg = document.createElement("img");
            tempImg.src = data;
            this.data = tempImg;
            this.dataType = "image";
        }else if (typeof data == "object") {
            let hex = "#";
            hex += data[0].toString(16).length == 1 ? "0" + data[0].toString(16) : data[0].toString(16);
            hex += data[1].toString(16).length == 1 ? "0" + data[1].toString(16) : data[1].toString(16);
            hex += data[2].toString(16).length == 1 ? "0" + data[2].toString(16) : data[2].toString(16);
            this.data = hex;
            this.dataType = "color";
        }else if (typeof data == "string") {
            this.data = data;
            this.dataType = "color";
        }else{
            this.data = null;
            this.dataType = "undefined";
            console.log(data.toString() + " is not a valid render type");
        }
    }
}
class Camera {
    static requiresParent = true;
    constructor(tilesize) {
        this.tilesize = tilesize;
        this.frameRate = 60;
        this.display = document.getElementById("mainDisplay").getContext("2d");
        this.follow = null;
        this.followSpeed = 10;
        this.enabled = true;
    }
    renderScene(scene) {
        if (!this.enabled) {return}
        this.display.clearRect(0, 0, windowWidth, windowHeight);
        scene.forEach(object => {
            if (object.getComponentID("Renderer") != -1 && object.getComponent("Renderer").enabled) {
                if (object.getComponent("Renderer").dataType == "color") {
                    let trans = new Vector2();
                    trans.x = (object.transform.position.x - this.parent.transform.position.x) * this.tilesize + (object.transform.scale.x / 2 * this.tilesize);
                    trans.y = (object.transform.position.y - this.parent.transform.position.y) * this.tilesize + (object.transform.scale.y / 2 * this.tilesize);
                    this.display.translate(trans.x, trans.y);
                    this.display.rotate(-object.transform.rotation * (Math.PI/180));
                    this.display.translate(-trans.x, -trans.y);
                    this.display.fillStyle = object.getComponent("Renderer").data;
                    this.display.fillRect((object.transform.position.x - this.parent.transform.position.x) * this.tilesize, (object.transform.position.y - this.parent.transform.position.y) * this.tilesize, object.transform.scale.x * this.tilesize, object.transform.scale.y * this.tilesize);
                    this.display.translate(trans.x, trans.y);
                    this.display.rotate(object.transform.rotation * (Math.PI/180));
                    this.display.translate(-trans.x, -trans.y);
                }else if (object.getComponent("Renderer").dataType == "image") {
                    let trans = new Vector2();
                    trans.x = (object.transform.position.x - this.parent.transform.position.x) * this.tilesize + (object.transform.scale.x / 2 * this.tilesize);
                    trans.y = (object.transform.position.y - this.parent.transform.position.y) * this.tilesize + (object.transform.scale.y / 2 * this.tilesize);
                    this.display.translate(trans.x, trans.y);
                    this.display.rotate(-object.transform.rotation * (Math.PI/180));
                    this.display.translate(-trans.x, -trans.y);
                    this.display.drawImage(object.getComponent("Renderer").data, (object.transform.position.x - this.parent.transform.position.x) * this.tilesize, (object.transform.position.y - this.parent.transform.position.y) * this.tilesize, object.transform.scale.x * this.tilesize, object.transform.scale.y * this.tilesize);
                    this.display.translate(trans.x, trans.y);
                    this.display.rotate(object.transform.rotation * (Math.PI/180));
                    this.display.translate(-trans.x, -trans.y);
                }else{
                    console.log("Could not render object" + scene.indexOf(object) + "as it has unsupported render data.");
                }
            }
        });
    }
    renderGameObject(object) {
        if (!this.enabled) {return}
        if (object.getComponentID("Renderer") != -1 && object.getComponent("Renderer").enabled) {
            if (object.getComponent("Renderer").dataType == "color") {
                let trans = new Vector2();
                trans.x = (object.transform.position.x - this.parent.transform.position.x) * this.tilesize + (object.transform.scale.x / 2 * this.tilesize);
                trans.y = (object.transform.position.y - this.parent.transform.position.y) * this.tilesize + (object.transform.scale.y / 2 * this.tilesize);
                this.display.translate(trans.x, trans.y);
                this.display.rotate(-object.transform.rotation * (Math.PI/180));
                this.display.translate(-trans.x, -trans.y);
                this.display.fillStyle = object.getComponent("Renderer").data;
                this.display.fillRect((object.transform.position.x - this.parent.transform.position.x) * this.tilesize, (object.transform.position.y - this.parent.transform.position.y) * this.tilesize, object.transform.scale.x * this.tilesize, object.transform.scale.y * this.tilesize);
                this.display.translate(trans.x, trans.y);
                this.display.rotate(object.transform.rotation * (Math.PI/180));
                this.display.translate(-trans.x, -trans.y);
            }else if (object.getComponent("Renderer").dataType == "image") {
                let trans = new Vector2();
                trans.x = (object.transform.position.x - this.parent.transform.position.x) * this.tilesize + (object.transform.scale.x / 2 * this.tilesize);
                trans.y = (object.transform.position.y - this.parent.transform.position.y) * this.tilesize + (object.transform.scale.y / 2 * this.tilesize);
                this.display.translate(trans.x, trans.y);
                this.display.rotate(-object.transform.rotation * (Math.PI/180));
                this.display.translate(-trans.x, -trans.y);
                this.display.drawImage(object.getComponent("Renderer").data, (object.transform.position.x - this.parent.transform.position.x) * this.tilesize, (object.transform.position.y - this.parent.transform.position.y) * this.tilesize, object.transform.scale.x * this.tilesize, object.transform.scale.y * this.tilesize);
                this.display.translate(trans.x, trans.y);
                this.display.rotate(object.transform.rotation * (Math.PI/180));
                this.display.translate(-trans.x, -trans.y);
            }else{
                console.log("Could not render object as it has unsupported render data.");
            }
        }
    }
    setFrameRate(n) {
        if (!this.enabled) {return}
        clearInterval(updateInterval);
        updateInterval = setInterval(function() {
            preUpdate();
            if (typeof update == "function") {update()}
            postUpdate();
        }, 1000 / Math.clamp(n, 1, 60))
    }
    update() {
        if (!this.enabled) {return}
        // Camera Follow
        if (this.follow != null) {
            let temp = new Vector2();
            temp.x = this.follow.transform.position.x - (windowWidth / this.tilesize) / 2 + this.follow.transform.scale.x / 2;
            temp.y = this.follow.transform.position.y - (windowHeight / this.tilesize) / 2 + this.follow.transform.scale.y / 2;
            this.parent.transform.position.lerp(temp, this.followSpeed);
        }
    }
}
class Rigidbody {
    static requiresParent = true;
    constructor(bounce) {
        this.enabled = true;
        this.velocity = new Vector2();
        
        this.bounce = bounce;

        this.timeStuck = 0;
    }
    addForce(force) {
        this.velocity.x += force.x;
        this.velocity.y += force.y;
    }
    setForce(force) {
        this.velocity = force;
    }
    update() {
        if (this.enabled) {
            if (this.parent.getComponent("Collider") != null) {
                if (this.parent.getComponent("Collider").checkCollision()) {
                    this.velocity.y *= -this.bounce;
                }
            }
            //this.velocity.y = Math.min(this.velocity.y, this.terminalVelocity);
            //console.log(this.velocity.y);
            if (this.timeStuck < 2) {
                this.velocity.y += 0.01;
            }
            this.parent.transform.position.y += this.velocity.y;
            if (this.parent.getComponent("Collider") != null) {
                if (this.parent.getComponent("Collider").checkCollision()) {
                    this.timeStuck++;
                }else{
                    this.timeStuck = 0;
                }
            }
        }
    }
}
class Collider {
    static requiresParent = true;
    constructor() {
        this.enabled = true;
    }
    checkCollision() {
        for(let i = 0; i < Scene.length; i++) {
            if (Scene[i] != this.parent && Scene[i].getComponent("Collider") != null) {
                if ((this.parent.transform.position.x > Scene[i].transform.position.x && this.parent.transform.position.x < Scene[i].transform.position.x + Scene[i].transform.scale.x) ||
                    (this.parent.transform.position.x + this.parent.transform.scale.x > Scene[i].transform.position.x && this.parent.transform.position.x + this.parent.transform.scale.x < Scene[i].transform.position.x + Scene[i].transform.scale.x)) {
                    if ((this.parent.transform.position.y > Scene[i].transform.position.y && this.parent.transform.position.y < Scene[i].transform.position.y + Scene[i].transform.scale.y) ||
                        (this.parent.transform.position.y + this.parent.transform.scale.y > Scene[i].transform.position.y && this.parent.transform.position.y + this.parent.transform.scale.y < Scene[i].transform.position.y + Scene[i].transform.scale.y)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
class Vector2 {
    constructor(x, y) {
        if (arguments.length == 2) {
            this.x = x;
            this.y = y;
        }else{
            this.x = 0;
            this.y = 0;
        }
    }
    lerp(target, speed) {
        this.x += (target.x - this.x) / speed;
        this.y += (target.y - this.y) / speed;
    }
}
function preUpdate() {
    Scene.forEach(object => {
        object.components.forEach(component => {
            if (typeof component.update == "function") {component.update()}
        });
    });
    display.camera.getComponent("Camera").renderScene(Scene);
}
function postUpdate() {
    
}
function setCamera(cam) {
    display.camera = cam;
}
function validURL(st) {
    if (typeof st != "string") {return false}
    let res = st.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};