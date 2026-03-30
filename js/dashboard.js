// Global State
let selectedType = "LengthUnit";
let selectedAction = "add"; // Default arithmetic action
let isArithmeticMode = true;

// Units synced with your Java Enums
const units = {
    LengthUnit: ["FEET", "INCHES", "YARD", "CENTIMETRE"],
    WeightUnit: ["KG", "GRAM", "POUND"],
    VolumeUnit: ["MILILITRE", "LITRE", "GALLON"],
    TemperatureUnit: ["CELSIUS", "FAHRENHEIT", "KELVIN"]
};

window.onload = () => {
    loadUnits();
};

function setType(type, element) {
    selectedType = type;
    
    // UI Active state
    document.querySelectorAll('.type-card').forEach(card => card.classList.remove('active'));
    element.classList.add('active');
    
    loadUnits();
}

function loadUnits() {
    const unit1 = document.getElementById("unit1");
    const unit2 = document.getElementById("unit2");

    // Clear existing
    unit1.innerHTML = "";
    unit2.innerHTML = "";

    // Fill from enum map
    units[selectedType].forEach(u => {
        const option1 = new Option(u, u);
        const option2 = new Option(u, u);
        unit1.add(option1);
        unit2.add(option2);
    });
}

function setAction(action, element) {
    const opSelect = document.getElementById("operator-select");
    const opStatic = document.getElementById("operator-static");
    
    // UI Active state
    document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    if (action === 'arithmetic') {
        isArithmeticMode = true;
        opSelect.style.display = "block";
        opStatic.style.display = "none";
        updateSelectedAction(); // Get current value from dropdown
    } else {
        isArithmeticMode = false;
        selectedAction = action;
        opSelect.style.display = "none";
        opStatic.style.display = "flex";
        opStatic.innerText = action === 'compare' ? "VS" : "→";
    }
}

function updateSelectedAction() {
    if (isArithmeticMode) {
        selectedAction = document.getElementById("operator-select").value;
    }
}

async function calculate() {
    const token = localStorage.getItem("token");
    const val1 = document.getElementById("value1").value;
    const val2 = document.getElementById("value2").value;
    const u1 = document.getElementById("unit1").value;
    const u2 = document.getElementById("unit2").value;

    const requestBody = {
        thisQuantityDTO: { value: parseFloat(val1), unit: u1, measurementType: selectedType },
        thatQuantityDTO: { value: parseFloat(val2), unit: u2, measurementType: selectedType }
    };

    // Use selectedAction which is now updated by the dropdown OR buttons
    let url = `http://localhost:8080/api/v1/quantities/${selectedAction}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        document.getElementById("result-box").style.display = "block";
        document.getElementById("result-text").innerText = result.resultValue.toFixed(3);
        document.getElementById("result-unit-label").innerText = result.resultUnit;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Modify the end of your calculate() function to update the unit label:
// ... inside calculate() after getting result ...
document.getElementById("result-text").innerText = result.value;
document.getElementById("result-unit-label").innerText = result.unit;