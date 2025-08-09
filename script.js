document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = document.getElementById("fileInput").files[0];
  if (!file) {
    alert("Please choose an image first.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64Image = reader.result;
    document.getElementById("status").innerText = "Enhancing... ⏳";

    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await res.json();

      if (data.error) {
        document.getElementById("status").innerText = "❌ " + data.error;
        return;
      }

      // Directly show the final image
      document.getElementById("outputImage").src = data.output;
      document.getElementById("status").innerText = "✅ Done!";
    } catch (err) {
      console.error(err);
      document.getElementById("status").innerText = "❌ Failed to connect to API.";
    }
  };

  reader.readAsDataURL(file);
});
