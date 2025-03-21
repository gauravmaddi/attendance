document.addEventListener("DOMContentLoaded", function () {
    let datePicker = document.getElementById("datePicker");
    let cardsContainer = document.getElementById("cardsContainer");

    if (!datePicker || !cardsContainer) {
        console.error("Element not found! Check your HTML IDs.");
        return;
    }

    datePicker.addEventListener("change", function () {
        let selectedDate = new Date(datePicker.value);
        generateWeekCards(selectedDate);
    });

    async function fetchStoredData() {
        try {
            let response = await fetch("/get-time-entries/");
            return await response.json();
        } catch (error) {
            console.error("Error fetching stored data:", error);
            return [];
        }
    }

    async function saveTimeEntry(date, inTime, outTime, duration) {
        try {
            await fetch("/save-time-entry/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, in_time: inTime, out_time: outTime, duration })
            });
        } catch (error) {
            console.error("Error saving time entry:", error);
        }
    }

    async function generateWeekCards(selectedDate) {
        let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dayIndex = selectedDate.getDay();
        let mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;
        let mondayDate = new Date(selectedDate);
        mondayDate.setDate(selectedDate.getDate() + mondayOffset);

        let storedData = await fetchStoredData();
        cardsContainer.innerHTML = "";

        for (let i = 0; i < 7; i++) {
            let newDate = new Date(mondayDate);
            newDate.setDate(mondayDate.getDate() + i);
            let formattedDate = newDate.toISOString().split('T')[0];
            let storedEntry = storedData.find(entry => entry.date === formattedDate);

            let inTimeValue = storedEntry ? storedEntry.in_time || "" : "";
            let outTimeValue = storedEntry ? storedEntry.out_time || "" : "";
            let durationValue = storedEntry ? storedEntry.duration || "0" : "0";

            // Card container
            let card = document.createElement("div");
            card.className = "bg-white p-4 rounded shadow-md text-center border";

            // Date Info
            let dateInfo = document.createElement("div");
            dateInfo.className = "text-lg font-bold text-gray-600 mb-2";
            dateInfo.innerHTML = `<h2>${daysOfWeek[newDate.getDay()]}</h2><p>${formattedDate}</p>`;

            // Time Inputs
            let timeInputs = document.createElement("div");
            timeInputs.className = "flex gap-2 mb-2";

            let inTime = createInput(inTimeValue, "IN Time");
            let outTime = createInput(outTimeValue, "OUT Time");
            let duration = createInput(durationValue, "Duration");
            duration.readOnly = true;

            // Action Button
            let actionButton = document.createElement("button");
            actionButton.className = "px-4 py-2 text-white rounded w-full";
            if (!inTimeValue) {
                actionButton.classList.add("bg-green-500");
                actionButton.innerText = "IN";
            } else if (!outTimeValue) {
                actionButton.classList.add("bg-red-500");
                actionButton.innerText = "OUT";
            } else {
                actionButton.style.display = "none";
            }

            actionButton.onclick = async function () {
                let now = new Date();
                let timeString = now.toLocaleTimeString('en-US', { hour12: false });
                if (actionButton.innerText === "IN") {
                    inTime.value = timeString;
                    actionButton.classList.remove("bg-green-500");
                    actionButton.classList.add("bg-red-500");
                    actionButton.innerText = "OUT";
                } else {
                    outTime.value = timeString;
                    let inDateTime = new Date(`${formattedDate} ${inTime.value}`);
                    let outDateTime = new Date(`${formattedDate} ${outTime.value}`);
                    let diff = (outDateTime - inDateTime) / 1000;
                    let hours = Math.floor(diff / 3600);
                    let minutes = Math.floor((diff % 3600) / 60);
                    let seconds = diff % 60;
                    duration.value = `${hours}h ${minutes}m ${seconds}s`;
                    actionButton.style.display = "none";
                }
                await saveTimeEntry(formattedDate, inTime.value, outTime.value, duration.value);
            };

            // Append elements
            timeInputs.appendChild(inTime);
            timeInputs.appendChild(outTime);

            card.appendChild(dateInfo);
            card.appendChild(timeInputs);
            card.appendChild(duration);
            card.appendChild(actionButton);
            cardsContainer.appendChild(card);
        }
    }

    function createInput(value, placeholder) {
        let input = document.createElement("input");
        input.className = "border p-2 text-center w-full";
        input.placeholder = placeholder;
        input.readOnly = true;
        input.value = value;
        return input;
    }
});
