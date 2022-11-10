function ApiSearch(message) {
  console.log("Search: ", message);
  const params = {
    q: message,
  };
  return sdk.searchGet(params, {}, {});
}

function update_images(images) {
  document.querySelector("#picture").replaceChildren();
  images.forEach((element) => {
    //modify image url
    const sub = element.substring(49);
    src = `https://6998hm2.s3.amazonaws.com/${sub}`;
    const picture_holder = document.createElement("div");
    picture_holder.classList.add("col-6");
    const picture = document.createElement("img");
    picture.setAttribute("src", src);
    picture_holder.appendChild(picture);
    document.querySelector("#picture").appendChild(picture_holder);
  });
}

function process_message() {
  const text = document.querySelector("#input-buffer").value;
  document.querySelector("#input-buffer").value = "";
  ApiSearch(text)
    .then((response) => {
      console.log("Response: ", response.data);
      let images = response.data;
      update_images(images);
    })
    .catch((error) => {
      console.log("Error: ", error);
      $("#input-warning").html("search failed, try again");
    });
}

function generate_voice_btn() {
  document.querySelector("#voice-btn").addEventListener("click", function () {
    console.log("Start Clicked");
    Dictation();
  });
  document.querySelector("#voice-btn").innerHTML = "Start Voice";
}

function generate_stop_btn(recg) {
  // $("#voice-btn").unbind("click");
  document.querySelector("#voice-btn").addEventListener("click", function () {
    recg.stop();
    console.log("Stop Clicked");
    generate_voice_btn();
  });
  document.querySelector("#voice-btn").innerHTML = "Stop Voice";
}

function Dictation() {
  if (window.hasOwnProperty("webkitSpeechRecognition")) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    generate_stop_btn(recognition);
    recognition.start();
    console.log("ready to receive a lable");

    recognition.onresult = function (e) {
      document.querySelector("#input-buffer").value =
        e.results[0][0].transcript;
      recognition.stop();
      generate_voice_btn();
    };
    console.log("finish lisening");
    recognition.onerror = function (e) {
      console.log("dicatation error!",e);
      recognition.stop();
      // generate_voice_btn()
    };
  } else {
    alert("Sorry, Your browser doesn't support this.");
  }
}

function imge_type(key) {
  if (key.includes("jpeg")) {
    return "image/jpeg";
  } else if (key.includes("png")) {
    return "image/png";
  } else if (key.includes("jpg")) {
    return "image/jpg";
  }
}

function ready() {
  document.querySelector("#search-btn").addEventListener("click", function () {
    process_message();
    document.querySelector("#input-warning").innerHTML = "";
  });

  generate_voice_btn();
  document.querySelector("#upload-btn").addEventListener("click", function () {
    const file = document.querySelector("#customFile").files[0];
    const custome_labels = document.querySelector("#label-buffer").value.trim();
    const key = file.name;
    const url = `https://xk4u0p8z78.execute-api.us-east-1.amazonaws.com/test-stage/upload/6998hm2/${key}`;
    console.log(custome_labels);
    console.log("key:", key);
    axios
      .put(url, file, {
        headers: {
          "Content-Type": imge_type(key),
          "x-amz-meta-customLabels": custome_labels,
        },
      })
      .then((response) => {
        console.log("Upload Successfull:", response);
      })
      .catch((error) => {
        console.log("Woops, get an error: ", error);
      });
  });
}

console.log(document.readyState);
if (document.readyState === "complete" || document.readyState !== "loading") {
  ready();
} else {
  document.addEventListener("DOMContentLoaded", ready);
}
