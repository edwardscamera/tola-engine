function preload() {

}
function setup() {
    cam = new GameObject(new Vector2(), new Camera(32));
    setCamera(cam);
    box = new GameObject(
        new Vector2(),
        new Renderer("black"),
        new Collider(),
        new Rigidbody(0.7)
    );
    cam.getComponent("Camera").follow = box;

    ground = new GameObject(
        new Vector2(-10, 10),
        new Renderer("black"),
        new Rigidbody(),
        new Collider()
    );
    ground.getComponent("Rigidbody").enabled = false;
    ground.transform.scale = new Vector2(20, 3);
}
function update() {
    
}