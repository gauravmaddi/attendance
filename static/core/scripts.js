document.addEventListener("DOMContentLoaded", function () {
    let datePicker = document.getElementById("datePicker");
    let cardsContainer = document.getElementById("cardsContainer");

    if (!datePicker || !cardsContainer) {
        console.error("Element not found! Check your HTML IDs.");
        return;
    }

    datePicker.addEventListener("change", function () {
        let selectedDate = new Date(datePicker.value);
        console.log(selectedDate);
        
        generateWeekCards(selectedDate);
    });

    async function fetchStoredData() {
        try {
            let response = await fetch("/get-time-entries/");
            let data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching stored data:", error);
            return [];
        }
    }

    async function saveTimeEntry(date, day, inTime, outTime, duration) {
        try {
            await fetch("/save-time-entry/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, day, in_time: inTime, out_time: outTime, duration })
            });
        } catch (error) {
            console.error("Error saving time entry:", error);
        }
    }

    async function generateWeekCards(selectedDate) {
        let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dayIndex = selectedDate.getDay();
        console.log(dayIndex);
        
        let mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;
        console.log(mondayOffset);
        
        let mondayDate = new Date(selectedDate);
        console.log(mondayDate);
        
        mondayDate.setDate(selectedDate.getDate() + mondayOffset);
        console.log(mondayDate.toDateString()); 


        let storedData = await fetchStoredData();
        console.log(storedData);
        

        cardsContainer.innerHTML = "";

        for (let i = 0; i < 7; i++) {
            let newDate = new Date(mondayDate);
            newDate.setDate(mondayDate.getDate() + i);
            let dayName = daysOfWeek[newDate.getDay()];
            
            
            let formattedDate = newDate.toISOString().split('T')[0];
           
            let storedEntry = storedData.find(entry => entry.date === formattedDate);
                
            let inTimeValue = storedEntry ? storedEntry.in_time || "" : "";
            let outTimeValue = storedEntry ? storedEntry.out_time || "" : "";
            let durationValue = storedEntry ? storedEntry.duration || "" : "";

            let card = document.createElement("div");
            card.className = "bg-white p-4 rounded shadow-md text-center";

            let inTime = document.createElement("input");
            inTime.className = "border p-2 m-2 text-center";
            inTime.placeholder = "IN Time";
            inTime.readOnly = true;
            inTime.value = inTimeValue;

            let outTime = document.createElement("input");
            outTime.className = "border p-2 m-2 text-center";
            outTime.placeholder = "OUT Time";
            outTime.readOnly = true;
            outTime.value = outTimeValue;

            let duration = document.createElement("input");
            duration.className = "border p-2 m-2 text-center";
            duration.placeholder = "Duration";
            duration.readOnly = true;
            duration.value = durationValue;

            let inButton = document.createElement("button");
            inButton.className = "bg-green-500 text-white px-4 py-2 rounded m-2";
            inButton.innerText = "IN";
            inButton.onclick = async function () {
                let now = new Date();
                let timeString = now.toLocaleTimeString('en-US', { hour12: false });
                inTime.value = timeString;
                await saveTimeEntry(formattedDate, dayName, timeString, outTime.value, duration.value);
            };

            let outButton = document.createElement("button");
            outButton.className = "bg-red-500 text-white px-4 py-2 rounded m-2";
            outButton.innerText = "OUT";
            outButton.onclick = async function () {
                let now = new Date();
                let timeString = now.toLocaleTimeString('en-US', { hour12: false });
                outTime.value = timeString;

                if (inTime.value) {
                    let inDateTime = new Date(`${formattedDate} ${inTime.value}`);
                    let outDateTime = new Date(`${formattedDate} ${outTime.value}`);
                    let diff = (outDateTime - inDateTime) / 1000;

                    let hours = Math.floor(diff / 3600);
                    let minutes = Math.floor((diff % 3600) / 60);
                    let seconds = diff % 60;
                    duration.value = `${hours}h ${minutes}m ${seconds}s`;

                    await saveTimeEntry(formattedDate, dayName, inTime.value, outTime.value, duration.value);
                }
            };

            card.innerHTML = `<h2 class="text-lg font-bold">${dayName}</h2><p class="text-gray-600">${formattedDate}</p>`;
            card.appendChild(inTime);
            card.appendChild(outTime);
            card.appendChild(duration);
            card.appendChild(inButton);
            card.appendChild(outButton);

            cardsContainer.appendChild(card);
        }
    }
});
