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
        const maxWidth = 800;
        const maxHeight = 800;

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
        canvas.width = width;
        canvas.height = height;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, width, height);

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
  itemName.textContent ="Lost Item: "+ item.itemName;

  // Create the item description element
  const itemDescription = document.createElement("p");
  itemDescription.classList.add("card-text");
  itemDescription.textContent ="Location " + item.itemDescription;

  // Create the date element
  const date = document.createElement("p");
  date.classList.add("card-text");
  date.textContent = "Date: " + item.date;

  // Create the contact information element
  const contactInfo = document.createElement("p");
  contactInfo.classList.add("card-text");
  contactInfo.textContent = "Contact Information: " + item.contactInfo;

  //create a button
  const contactOwner = document.createElement("a");
  contactOwner.classList.add("card-text")
  contactOwner.id="emailFounder"
  contactOwner.innerText = "Contact Owner";
  contactOwner.href = "mailto:"+item.contactInfo;
  
 
  // Append the elements to their respective parents
  cardBody.appendChild(itemName);
  cardBody.appendChild(itemDescription);
  cardBody.appendChild(date);
  cardBody.appendChild(contactInfo);
  cardBody.appendChild(contactOwner)
  card.appendChild(image);
  card.appendChild(cardBody);
  cardContainer.appendChild(card);

  // Apply CSS styles
  card.style.display = "flex";
  card.style.flexDirection ="column"
  card.style.outline ="none"

  cardBody.style.display = "flex";
  cardBody.style.flexDirection ="column"
  cardBody.style.outline ="none"
 

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
      }
    })
    .catch((error) => {
      console.error("Error fetching items from the database:", error);
    });
}

fetchItemsFromDatabase();




//filter the results

const searchQuery = document.getElementById("search-input");
const searchSubmit = document.getElementById("search-submit");

searchSubmit.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent the default form submission behavior

  const searchTerm = searchQuery.value.toLowerCase(); // Get the search term and convert it to lowercase

  // Get all the card elements
  const cards = document.getElementsByClassName("card");

  // Iterate over the cards and hide/show them based on the search term
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const itemName = card.querySelector(".card-title").textContent.toLowerCase(); // Get the item name from the card and convert it to lowercase

    if (itemName.includes(searchTerm)) {
      card.style.display = "block"; // Show the card if the item name matches the search term
    } else {
      card.style.display = "none"; // Hide the card if the item name does not match the search term
    }
  }

  hideNonMatchingCards(); // Call the function to visually hide non-matching cards
});

function hideNonMatchingCards() {
  // Get all the card elements
  const cards = document.getElementsByClassName("card");

  // Iterate over the cards and add a CSS class to visually hide the non-matching cards
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    if (card.style.display !== "block") {
      card.classList.add("d-none"); // Add the CSS class to hide the card
    } else {
      card.classList.remove("d-none"); // Remove the CSS class if the card is displayed
    }
  }
}
