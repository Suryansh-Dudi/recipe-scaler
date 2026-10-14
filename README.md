# 🍳 Recipe Scaler

A simple, responsive web application that helps you adjust ingredient quantities based on the number of servings you want to prepare.

🔗 **Live Demo:** [Recipe Scaler](https://suryansh-dudi.github.io/recipe-scaler/)
<img width="1906" height="750" alt="image" src="https://github.com/user-attachments/assets/4f3fc247-ca6e-4c2d-9bd3-cda5db3e5adc" />


## 📌 About the Project

Have you ever found a recipe for 2 people but needed to cook for 5? Recipe Scaler makes it easier to adjust ingredient quantities without calculating everything manually.

Enter the original number of servings, your desired servings, and the ingredient quantities. The app calculates the adjusted quantities for you.

## ✨ Features

- **Easy Recipe Scaling:** Adjust ingredient quantities according to your desired servings.
- **Simple Interface:** Enter your recipe details and calculate the new quantities.
- **Input Validation:** Helps prevent invalid serving values, such as zero or negative numbers.
- **Responsive Design:** Designed to work across different screen sizes.
- **Lightweight:** Built using basic web technologies without requiring a complex setup.

## 🛠️ Built With

- HTML
- CSS
- JavaScript

## 🚀 How to Use

1. Open the [live website](https://suryansh-dudi.github.io/recipe-scaler/).
2. Enter the dish name.
3. Enter the original number of servings.
4. Enter the number of servings you want to prepare.
5. Add the ingredient names and their original quantities.
6. Click the scale or calculate button to see the adjusted quantities.

## 🧮 How It Works

The application uses a simple proportional calculation:

**Scaled Quantity = Original Quantity × (Desired Servings ÷ Original Servings)**

For example, if a recipe requires 200 g of flour for 2 servings and you want to prepare 4 servings:

`200 × (4 ÷ 2) = 400 g`

The scaled quantity will be **400 g of flour**.

## 📂 Project Structure

```text
recipe-scaler/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🌐 Deployment

This project is hosted using **GitHub Pages**.

Visit the live application here:  
https://suryansh-dudi.github.io/recipe-scaler/

## 🎯 Purpose

This project was created as a hands-on learning experience in web development and building a functional application with HTML, CSS, and JavaScript.

## 👨‍💻 Author

**Suryansh Dudi**

- GitHub: [@Suryansh-Dudi](https://github.com/Suryansh-Dudi)

---

If you find this project useful, feel free to explore the repository!
