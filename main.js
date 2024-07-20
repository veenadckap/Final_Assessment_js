// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCNO03Z3NG51-WV7F9WuGIjUaVAccTIYck",
    authDomain: "dashboardinvertory.firebaseapp.com",
    projectId: "dashboardinvertory",
    storageBucket: "dashboardinvertory.appspot.com",
    messagingSenderId: "314937792614",
    appId: "1:314937792614:web:e69e810641970522da35a7"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const productList = document.querySelector('.product_lists');
    const addProductButton = document.getElementById('addProduct');
    const updateProductButton = document.getElementById('updateProduct');
    const formContainer = document.getElementById('formContainer');
    const tableContainer = document.getElementById('table');

    // Function to create product card
    function createProductCard(productName, quality) {
        const card = document.createElement('div');
        card.className = 'product_card';

        const cardTitle = document.createElement('h2');
        cardTitle.textContent = productName;

        const cardQuantity = document.createElement('p');
        cardQuantity.textContent = `Quantity: ${Number(quality)}`;

        card.appendChild(cardTitle);
        card.appendChild(cardQuantity);

        return card;
    }

    async function loadProducts() {
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            if (!querySnapshot.empty) {
                const products = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    products.push(data);
                });

                products.sort((a, b) => b.quality - a.quality);
                const topProducts = products.slice(0, 3);

                productList.innerHTML = '';

                topProducts.forEach(product => {
                    const productCard = createProductCard(product.productName, product.quality);
                    productList.appendChild(productCard);
                });

            } else {
                productList.textContent = 'No products available';
            }
        } catch (error) {
            console.error('Error fetching products: ', error);
            productList.textContent = 'Error loading products';
        }
    }

    // Function to load inventory data
    async function loadInventoryData() {
        tableContainer.innerHTML = ''; 

        try {
            const querySnapshot = await getDocs(collection(db, 'inventoryUpdates'));
            if (!querySnapshot.empty) {
                const createTable = document.createElement('table');
                const createThead = document.createElement('thead');
                const createTbody = document.createElement('tbody');

                const headerRow = document.createElement('tr');
                const headerCell1 = document.createElement('th');
                headerCell1.textContent = 'Product';
                const headerCell2 = document.createElement('th');
                headerCell2.textContent = 'Recipient';
                const headerCell3 = document.createElement('th');
                headerCell3.textContent = 'Quality';

                headerRow.appendChild(headerCell1);
                headerRow.appendChild(headerCell2);
                headerRow.appendChild(headerCell3);
                createThead.appendChild(headerRow);

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const dataRow = document.createElement('tr');
                    const dataCell1 = document.createElement('td');
                    dataCell1.textContent = data.productName ; 
                    const dataCell2 = document.createElement('td');
                    dataCell2.textContent = data.recipients ;
                    const dataCell3 = document.createElement('td');
                    dataCell3.textContent = data.quality ;

                    dataRow.appendChild(dataCell1);
                    dataRow.appendChild(dataCell2);
                    dataRow.appendChild(dataCell3);
                    createTbody.appendChild(dataRow);
                });

                createTable.appendChild(createThead);
                createTable.appendChild(createTbody);
                tableContainer.appendChild(createTable);
            } else {
                tableContainer.textContent = 'No data available';
            }
        } catch (error) {
            console.error('Error fetching inventory data: ', error);
            tableContainer.textContent = 'Error loading data';
        }
    }

// Function to show form for adding or updating
function showForm(type) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    formContainer.appendChild(overlay);

    const form = document.createElement('form');
    form.className = 'form-popup';

    const title = type === 'add' ? 'Add Product' : 'Update Inventory';
    let inputsHTML = `
        <div class="title">
            <h2>${title}</h2>
        </div>
        <input type="text" id="productName" name="productName" class='input' placeholder="Product Name" required>
        <br>
        <input type="text" id="quality" name="quality" class='input' placeholder="Quality" required>
        <br>
    `;

    if (type === 'update') {
        inputsHTML += `
            <input type="text" id="recipients" name="recipients" class='input' placeholder="Recipients" required>
            <br>
        `;
    }

    form.innerHTML = `
        ${inputsHTML}
        <div class="formButton">
            <button type="submit" class="formSubmit">Submit</button>
            <button type="button" id="closeForm" class="close-button">
                <svg width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                    <path d="M1.5 1.5a.75.75 0 0 1 1.06 0L8 6.44l5.44-5.44a.75.75 0 0 1 1.06 1.06L9.06 7.5l5.44 5.44a.75.75 0 0 1-1.06 1.06L8 8.56 2.56 14a.75.75 0 0 1-1.06-1.06L6.94 7.5 1.5 2.06A.75.75 0 0 1 1.5 1.5z"/>
                </svg>
            </button>
        </div>
    `;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm(form)) {
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            if (parseInt(data.quality) <= 0) {
                alert('Quality must be greater than zero.');
                return;
            }

            try {
                if (type === 'update') {
                    const productNameLower = data.productName.toLowerCase();
                    const querySnapshot = await getDocs(collection(db, 'products'));
                    let productExists = false;
                    let currentQuality = 0;

                    for (const doc of querySnapshot.docs) {
                        const docData = doc.data();
                        const docProductNameLower = docData.productName.toLowerCase();
                        if (docProductNameLower === productNameLower) {
                            productExists = true;
                            currentQuality = docData.quality;
                            if (parseInt(data.quality) > currentQuality) {
                                alert('Quality value is higher than the existing product quality.');
                                return;
                            }
                            const docRef = doc.ref;
                            await updateDoc(docRef, {
                                quality: currentQuality - parseInt(data.quality)
                            });
                            break; 
                        }
                    }

                    if (!productExists) {
                        alert('Product name does not exist.');
                        return;
                    }

                    // Update inventory
                    await addDoc(collection(db, 'inventoryUpdates'), data);
                    alert('Form submitted and data saved successfully!');
                    formContainer.innerHTML = ''; 

                    loadInventoryData(); // Load data after submitting
                } else {
                    // Add new product
                    await addDoc(collection(db, 'products'), data);
                    alert('Form submitted and data saved successfully!');
                    formContainer.innerHTML = ''; 
                    loadProducts(); // Load products after submitting
                }
            } catch (error) {
                console.error("Error adding or updating document: ", error);
                alert('There was an error saving the data. Please try again.');
            }
        }
    });

    formContainer.appendChild(form);

    const closeFormButton = document.getElementById('closeForm');
    if (closeFormButton) {
        closeFormButton.addEventListener('click', () => {
            formContainer.innerHTML = ''; 
        });
    } else {
        console.error('Close form button not found');
    }

    const qualityInput = form.querySelector('#quality');
    qualityInput.addEventListener('input', () => {
        if (isNaN(qualityInput.value.trim())) {
            qualityInput.classList.add('shake');
            qualityInput.setCustomValidity('Quality must be a number.');
        } else if (parseInt(qualityInput.value.trim()) <= 0) {
            qualityInput.classList.add('shake');
            qualityInput.setCustomValidity('Quality must be greater than zero.');
        } else {
            qualityInput.classList.remove('shake');
            qualityInput.setCustomValidity('');
        }
    });
}

    // Function to validate form inputs
    function validateForm(form) {
        let valid = true;
        const inputs = form.querySelectorAll('input');

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('shake');
                valid = false;
            } else {
                input.classList.remove('shake');
            }

            if (input.id === 'quality' && isNaN(input.value.trim())) {
                input.classList.add('shake');
                valid = false;
                input.setCustomValidity('Quality must be a number.');
            } else {
                input.classList.remove('shake');
                input.setCustomValidity('');
            }
        });

        if (!valid) {
            alert('Please fill out all required fields correctly.');
        }

        return valid;
    }

    // Initial load of products and inventory data
    loadProducts();
    loadInventoryData();

    // Add event listeners for form buttons
    addProductButton.addEventListener('click', () => showForm('add'));
    updateProductButton.addEventListener('click', () => showForm('update'));

    
});

// Function to load inventory data and render chart
async function loadChartData() {
    try {
        const querySnapshot = await getDocs(collection(db, 'inventoryUpdates'));

        const xValues = [];
        const yValues = [];
        const barColors = [];
       
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            xValues.push(data.productName);
            yValues.push(data.quality); 
            barColors.push('red');
        });

        if (xValues.length > 0) {
            new Chart("myChart", {
                type: "bar",
                data: {
                    labels: xValues,
                    datasets: [{
                        backgroundColor: barColors,
                        data: yValues
                    }]
                },
                options: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: "Inventory Status"
                    },
                    responsive: true,
                    maintainAspectRatio: false 
                },
            });
        } else {
            console.error('No data available for the chart');
        }
    } catch (error) {
        console.error('Error fetching inventory data: ', error);
    }
}

loadChartData();
