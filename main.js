import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, get, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

const appSettings = {
  databaseURL: "https://found-it-first-default-rtdb.firebaseio.com/",
  storageBucket: "found-it-first.appspot.com"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const storage = getStorage(app);

// Reference
const itemsInDb = ref(database, "lostItems");

const reportItem = document.getElementById("reportItem");
const itemName = document.getElementById("itemName");
const itemDescription = document.getElementById("itemDescription");
const date = document.getElementById("date");
const image = document.getElementById("image");
const contactInfo = document.getElementById("contactInfo");

// Function to compress and crop the image
function compressAndCropImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set the desired width and height for the compressed image
        const maxWidth = 400;
        const maxHeight = 400;

        let width = img.width;
        let height = img.height;

        // Calculate the new width and height while maintaining the aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        // Set the canvas dimensions to the new width and height
        
        canvas.width = 600;
        canvas.height = 600;

        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2

        // Draw the image on the canvas
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, width,height);

        // Convert the canvas image to Blob format
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg", // Set the desired image format
          0.8 // Set the desired image quality (0.8 represents 80%)
        );
      };
    };

    reader.onerror = function (error) {
      reject(error);
    };

    // Read the image file as data URL
    reader.readAsDataURL(file);
  });
}

reportItem.addEventListener("click", function (event) {
  event.preventDefault();

  // Get the values from the form fields
  const itemNameValue = itemName.value;
  const itemDescriptionValue = itemDescription.value;
  const dateValue = date.value;
  const contactInfoValue = contactInfo.value;

  // Validate the form fields
  if (
    itemNameValue === "" ||
    itemDescriptionValue === "" ||
    dateValue === "" ||
    contactInfoValue === ""
  ) {
    console.error("Please fill in all the fields");
    alert("Please fill in all the fields");
    return; // Stop further execution
  }

  // Get the file from the image input field
  const file = image.files[0];

  // Check if file exceeds the maximum size (1MB)
  const maxSize = 1 * 1024 * 1024; // 1MB in bytes
  if (file && file.size > maxSize) {
    console.error("Image size exceeds the maximum limit of 1MB");
    alert("Image size exceeds the maximum limit of 1MB");
    return; // Stop further execution
  }

  // Create an object with the values
  const newItem = {
    itemName: itemNameValue,
    itemDescription: itemDescriptionValue,
    date: dateValue,
    contactInfo: contactInfoValue,
    imageUrl: ""
  };

  // Add the new item to the database
  push(itemsInDb, newItem)
    .then((newItemRef) => {
      if (file) {
        // Compress and crop the image file
        return compressAndCropImage(file)
          .then((compressedFile) => {
            // Upload the compressed and cropped image file to Firebase Storage
            const storagePath = `images/${newItemRef.key}/${file.name}`;
            const imageRef = storageRef(storage, storagePath);
            return uploadBytes(imageRef, compressedFile).then(() => {
              return getDownloadURL(imageRef).then((imageUrl) => {
                newItem.imageUrl = imageUrl; // Update the imageUrl in newItem object
                const updates = {};
                updates[newItemRef.key] = newItem;
                return update(itemsInDb, updates); // Update the newItem in the database
              });
            });
          })
          .catch((error) => {
            console.error("Error compressing or uploading the image:", error);
            alert("Error compressing or uploading the image. Please try again later.");
          });
      }
    })
    .then(() => {
      console.log("Item added to the database");
      // Reset the form fields after successful submission
      itemName.value = "";
      itemDescription.value = "";
      date.value = "";
      image.value = "";
      contactInfo.value = "";
      alert("Item added successfully!");
    })
    .catch((error) => {
      console.error("Error adding item to the database:", error);
      alert("Error adding item to the database. Please try again later.");
    });
});

// Function to create an item card and add it to the UI
function createItemCard(item, itemKey) {
  // Create the card container
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("col");

  // Create the card element
  const card = document.createElement("div");
  card.classList.add("card");

  // Create the image element
  const image = document.createElement("img");

  image.src = item.imageUrl; // Assuming there is an "imageUrl" property in the item object
  image.classList.add("card-img-top");
  image.alt = "Item Image";

  // Create the card body
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  // Create the item name element
  const itemName = document.createElement("h5");
  itemName.classList.add("card-title");
  itemName.textContent = "Item Name: "+item.itemName;

  // Create the item description element
  const itemDescription = document.createElement("p");
  itemDescription.classList.add("card-text");
  itemDescription.textContent = 'Location: '  + item.itemDescription;

  // Create the date element
  const date = document.createElement("p");
  date.classList.add("card-text");
  date.textContent = "Date: " + item.date;

  // Create the contact information element
  const contactInfo = document.createElement("p");
  contactInfo.classList.add("card-text");
  contactInfo.textContent = "Contact Information: " + item.contactInfo;

  // Append the elements to their respective parents
  cardBody.appendChild(itemName);
  cardBody.appendChild(itemDescription);
  cardBody.appendChild(date);
  cardBody.appendChild(contactInfo);
  card.appendChild(image);
  card.appendChild(cardBody);
  cardContainer.appendChild(card);

  // Apply CSS styles
  card.style.display = "grid";
  card.style.outline = "none";
  card.style.border = "none"

  cardBody.style.display = "grid";
  
  // Get the database section element to append the card
  const databaseSection = document.getElementById("database");
  databaseSection.classList.remove("visually-hidden");
  const cardsContainer = databaseSection.querySelector(".row");
  cardsContainer.appendChild(cardContainer);
}

function fetchItemsFromDatabase() {
  // Retrieve the data from the "lostItems" reference in the database
  return get(ref(database, "lostItems"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        // If there are items in the database, iterate over them
        snapshot.forEach((childSnapshot) => {
          const item = childSnapshot.val();
          const itemKey = childSnapshot.key;
          // Call the createItemCard function to create the card and add it to the UI
          createItemCard(item, itemKey);
        });
      } else {
        console.log("No items found in the database");
        const nothing = document.getElementById("nothing");
        const emptyDb = document.createElement("p");
        emptyDb.innerText = "No lost items found!"
        emptyDb.style.color = "red";
        nothing.appendChild(emptyDb)
      }
    })
    .catch((error) => {
      console.error("Error fetching items from the database:", error);
    });
}

fetchItemsFromDatabase();




