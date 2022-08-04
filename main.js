import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { SwipeEventListener } from "swipe-event-listener";

import gsap from "gsap";
const world = {
  plane: {
    width: 500,
    height: 500,
    widthSegments: 50,
    heightSegments: 50,
  },
};

const radius = 200;

// const gui = new dat.GUI();
// gui.add(world.plane, "width", 10, 600).onChange(generatePlane);
// gui.add(world.plane, "height", 1, 600).onChange(generatePlane);
// gui.add(world.plane, "widthSegments", 5, 110).onChange(generatePlane);
// gui.add(world.plane, "heightSegments", 5, 110).onChange(generatePlane);

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );
  const colors = [];

  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
  }

  planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );

  {
    const { array } = planeMesh.geometry.attributes.position;

    const randomValues = [];
    for (let i = 0; i < array.length; i++) {
      if (i % 3 == 0) {
        const x = array[i];
        const y = array[i + 1];
        const z = array[i + 2];
        array[i] = (x + Math.random() - 0.5) * 3;
        array[i + 1] = (y + Math.random() - 0.5) * 3;
        array[i + 2] = (z + Math.random() - 0.5) * 30;
      }
      randomValues.push(Math.random() - 0.5);
    }

    planeMesh.geometry.attributes.position.randomValues = randomValues;

    planeMesh.geometry.attributes.position.originalPosition =
      planeMesh.geometry.attributes.position.array;
  }
}

const raycaster = new THREE.Raycaster();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.set(0, -150, 250); //camera
scene.background = new THREE.Color("#111111");
scene.fog = new THREE.Fog(0xdfe9f3, 350, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
);
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true,
});
const light = new THREE.DirectionalLight(0xffffff, 1.5);

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

light.position.set(0, -150, 250);

generatePlane();

//-----------testing-----------

scene.add(planeMesh);
scene.add(light);

const mouse = {
  x: undefined,
  y: undefined,
};
const mouseClick = {
  x: undefined,
  y: undefined,
};

let frame = 0;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  const { array, originalPosition, randomValues } =
    planeMesh.geometry.attributes.position;
  frame += 0.01;
  for (let i = 0; i < array.length; i += 3) {
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.09;
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.135;
    array[i + 2] =
      originalPosition[i + 2] + Math.cos(frame + randomValues[i + 2]) * 0.15;
  }
  planeMesh.geometry.attributes.position.needsUpdate = true;
  raycaster.setFromCamera(mouse, camera);
  const intersect = raycaster.intersectObject(planeMesh);
  if (intersect.length > 0) {
    const { color } = intersect[0].object.geometry.attributes;
    colorSetter(0.1, 0.5, 1, color, intersect);
    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4,
    };

    const hoverColor = {
      r: 0.1,
      g: 0.6,
      b: 1,
    };
    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        colorSetter(hoverColor.r, hoverColor.g, hoverColor.b, color, intersect);
      },
    });
  }
}
animate();

addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / innerWidth - 0.5) * 2;
  mouse.y = (event.clientY / innerHeight - 0.5) * -2;
});

// camera movement vector
const curve = new THREE.CubicBezierCurve3(
  new THREE.Vector3(0, -150, 250),
  new THREE.Vector3(0, -150, 80),
  new THREE.Vector3(0, 800, 80),
  new THREE.Vector3(10, 1800, 60)
);

const cameraRotation = new THREE.CubicBezierCurve3(
  new THREE.Vector3(degrees_to_radians(30.9637), 0, 0),
  new THREE.Vector3(degrees_to_radians(80), 0, 0),
  new THREE.Vector3(degrees_to_radians(110), 0, 0),
  new THREE.Vector3(degrees_to_radians(90), 0, 0)
);

document.getElementById("button-html").onclick = function onClick(params) {
  animateOnclick();
};

//------------------ Functions ------------------
function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}
function colorSetter(r, g, b, color, intersect) {
  color.setX(intersect[0].face.a, r);
  color.setY(intersect[0].face.a, g);
  color.setZ(intersect[0].face.a, b);

  // vertice 2
  color.setX(intersect[0].face.b, r);
  color.setY(intersect[0].face.b, g);
  color.setZ(intersect[0].face.b, b);

  // vertice 3
  color.setX(intersect[0].face.c, r);
  color.setY(intersect[0].face.c, g);
  color.setZ(intersect[0].face.c, b);

  color.needsUpdate = true;
}
function radians_to_degrees(radians) {
  var pi = Math.PI;
  return radians * (180 / pi);
}

let frameOnClick = 0;
let v = 0.001;
let a = 0.0001;
let opacity = 1,
  opacity2 = 0;
var div = document.getElementById("html-text");

//------animation------

function animateOnclick() {
  let animate = requestAnimationFrame(animateOnclick);
  renderer.render(scene, camera);
  if (frameOnClick > 1) {
    scene.remove(planeMesh);
    scene.remove(light);

    cancelAnimationFrame(animate);
    wheelLListener();
    return;
  }
  const dit = 0.013;
  if (opacity < 0 + dit && opacity > 0 - dit) {
    div.parentNode.removeChild(div);
    opacity = opacity - 1;
  }
  const pos = curve.getPoint(frameOnClick);
  const cameraRot = cameraRotation.getPoint(frameOnClick);
  if (pos.x < 4) {
    v = v + a * 0.5;
  } else {
    opacity2 += 0.0176;
    v = v - a * 1.42;
  }
  frameOnClick = frameOnClick + v;
  opacity = opacity - dit;
  div.style.opacity = opacity;
  camera.position.set(pos.x, pos.y, pos.z);
  camera.rotation.set(cameraRot.x, 0, 0);
  light.position.set(pos.x, pos.y, pos.z);
}
// ----------curve arc----------
const curveCircle = new THREE.EllipseCurve(
  10, // ax
  1850, // ay
  200, //xRadius
  200, //yRadius
  0, // aStartAngle
  2 * Math.PI, // aEndAngle
  false, // aClockwise
  0 // aRotation
);

const points = curveCircle.getPoints(50);
const geometry1 = new THREE.BufferGeometry().setFromPoints(points);

const material1 = new THREE.LineBasicMaterial({ color: 0xff0000 });

// Create the final object to add to the scene
const curveObject = new THREE.Line(geometry1, material1);

curveObject.position.z = 55;

//------------------ Second Scene Images ------------------
let y = 0;
let der = 25 / 360;
let position = 2 * der + 0.25;
const textureLoader = new THREE.TextureLoader();
const geometry = new THREE.PlaneBufferGeometry(70, 168);

const { swipeArea, updateOptions } = SwipeEventListener({
  swipeArea: document.querySelector("body"),
});
swipeArea.addEventListener("swipeLeft", (event) => {
  y = y + 0.005;
});

swipeArea.addEventListener("swipeRight", () => {
  y = y - 0.005;
});

// ----- Generating the images -----
let material = [];
import img0 from "./images/-2.jpg";
import img1 from "./images/-1.jpg";
import img2 from "./images/0.jpg";
import img3 from "./images/1.jpg";
import img4 from "./images/2.jpg";
import img5 from "./images/3.jpg";

let img = [];

material.push(
  new THREE.MeshBasicMaterial({
    map: textureLoader.load(img0),
  })
);
material.push(
  new THREE.MeshBasicMaterial({
    map: textureLoader.load(img1),
  })
);
material.push(
  new THREE.MeshBasicMaterial({
    map: textureLoader.load(img2),
  })
);
material.push(
  new THREE.MeshBasicMaterial({
    map: textureLoader.load(img3),
  })
);
material.push(
  new THREE.MeshBasicMaterial({
    map: textureLoader.load(img4),
  })
);
material.push(
  new THREE.MeshBasicMaterial({
    map: textureLoader.load(img5),
  })
);

for (let i = -2; i < 4; i++) {
  img.push(new THREE.Mesh(geometry, material[i + 2]));
  const y = i + 2;
  img[i + 2].name = y + "";
}
let pos = 0;
for (let i = -2; i < 4; i++) {
  pos = curveCircle.getPoint(position - (i + 2) * der); //getting position from the circle carve and setting each image offset
  img[i + 2].position.x = pos.x; //setting every image position x
  img[i + 2].position.y = pos.y; //setting every image position y
  img[i + 2].position.z = 60; //setting every image position z

  //---- calculating image angle using trigonometry  -----
  let angle = 0;
  let divide = (-pos.x + 10) / radius;
  angle = Math.acos(divide);
  angle = 90 - radians_to_degrees(angle);
  if (pos.x > 10) {
    //if the image is on the second side of the screen
    divide = (pos.x - 10) / radius;
    angle = Math.acos(divide);
    angle = 90 - radians_to_degrees(angle);
    angle = -angle;
  }

  img[i + 2].rotation.set(
    degrees_to_radians(90),
    degrees_to_radians(angle),
    degrees_to_radians(0)
  );

  scene.add(img[i + 2]);
}
//------wheelLListener------------
let raycaster1 = new THREE.Raycaster();

function wheelLListener() {
  raycaster.setFromCamera(mouse, camera);
  document.getElementById("html-text2").style.display = "block";

  //--------------HOVER----------
  const intersects = raycaster.intersectObjects(img);
  for (const intersect of intersects) {
    gsap.to(intersect.object.scale, {
      x: 1.4,
      y: 1.4,
    });
  }
  //invert
  if (intersects.length === 0) {
    //-------------- button onclick to github----------
    document.getElementById("button-github").onclick = function onClick() {
      window.location.href = "https://github.com/OfirMikel";
    };
    //-------------- button onclick to Linkedin----------
    document.getElementById("button-linkedin").onclick = function onClick() {
      window.location.href =
        "https://www.linkedin.com/in/ofir-mikel-72b15b242/";
    };
  }
  for (const object of img) {
    if (!intersects.find((intersect) => intersect.object === object)) {
      gsap.to(object.scale, {
        x: 1,
        y: 1,
      });
    }
  }

  //--------------SCROLL----------

  window.addEventListener("wheel", onMouseWheel);
  function onMouseWheel(event) {
    y = event.deltaY * 0.00005;
    scroll = true;
  }

  position += y;
  y *= 0.95;
  let pos = 0;
  for (let i = 0; i < 6; i++) {
    pos = curveCircle.getPoint(position - i * der);
    img[i].position.x = pos.x;
    img[i].position.y = pos.y;

    let angle = 0;
    let divide = (-pos.x + 10) / radius;
    angle = Math.acos(divide);
    angle = 90 - radians_to_degrees(angle);
    if (pos.x > 10) {
      divide = (pos.x - 10) / radius;
      angle = Math.acos(divide);
      angle = 90 - radians_to_degrees(angle);
      angle = -angle;
    }
    img[i].rotation.set(
      degrees_to_radians(90),
      degrees_to_radians(angle),
      degrees_to_radians(0)
    );
  }

  // -------Click-------
  renderer.domElement.addEventListener("click", onclick);
  function onclick(event) {
    mouseClick.x = (event.clientX / innerWidth - 0.5) * 2;
    mouseClick.y = (event.clientY / innerHeight - 0.5) * -2;
  }
  raycaster1.setFromCamera(mouseClick, camera);
  const intersectsClick = raycaster1.intersectObjects(img);
  for (const intersect of intersectsClick) {
    for (let i = 0; i < img.length; i++) {
      scene.remove(img[i]);
    }
    removeSphere();
    cameraMovement(intersect.object);
    return;
  }

  //--------------Run Animation----------
  requestAnimationFrame(wheelLListener);
  renderer.render(scene, camera);
}

// --------- Move camera OnClick of about ------------
let color = "rgb(0, 0, 0)";
function cameraMovement(image) {
  let counter = 0;
  function animate(params) {
    if (counter < 255) {
      counter += 15;
      const rgbSet = "rgb(" + counter + "," + counter + "," + counter + ")";
      scene.background.set(color);

      color = rgbSet;
    } else {
      return;
    }
    //--------------Run Animation----------
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
  switchShow(image.name);
  //---Showing Correct CSS
}

function goBackToCircle(params) {
  for (const image of img) {
    scene.add(image);
  }
  let color = "rgb(0, 0, 0)";
  scene.background.set(color);
}

function switchShow(name) {
  document.getElementById("html-text2").style.display = "none";
  switch (name) {
    case "0":
      document.getElementById("artify").style.display = "block";
      break;
    case "2":
      document.getElementById("about-me").style.display = "block";
      break;
    case "4":
      document.getElementById("mountain").style.display = "block";
      break;
    case "5":
      document.getElementById("portfolio").style.display = "block";
      break;
    default:
      document.getElementById("milu-in").style.display = "block";
      break;
  }
  document.getElementById("return").onclick = onClick;
  document.getElementById("return-from-miluin").onclick = onClick;
  document.getElementById("return-from-portfolio").onclick = onClick;
  document.getElementById("return-from-artify").onclick = onClick;
  document.getElementById("return-from-mountain").onclick = onClick;

  function onClick() {
    document.getElementById("about-me").style.display = "none";
    document.getElementById("portfolio").style.display = "none";
    document.getElementById("milu-in").style.display = "none";
    document.getElementById("artify").style.display = "none";
    document.getElementById("mountain").style.display = "none";

    goBackToCircle();
    mouseClick.x = undefined;
    mouseClick.y = undefined;
    wheelLListener();
  }
}

//------- Star Particle----------
var stars = [];
function addSphere() {
  for (var z = 300; z < 900; z += 35) {
    var geometry = new THREE.SphereGeometry(0.5, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0x888888 });
    var sphere = new THREE.Mesh(geometry, material);

    sphere.position.x = Math.random() * 1000 - 500;
    sphere.position.y = z;

    sphere.position.z = Math.random() * 150 + 90;
    sphere.scale.x = sphere.scale.y = 2;

    scene.add(sphere);

    stars.push(sphere);
  }
}
addSphere();

function removeSphere() {
  for (const star of stars) {
    scene.remove(star);
  }
}
