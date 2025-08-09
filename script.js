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
      // Step 1: Send image to API
      const enhanceRes = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const enhanceData = await enhanceRes.json();
      if (enhanceData.error) {
        document.getElementById("status").innerText = "❌ " + enhanceData.error;
        return;
      }

      const predictionId = enhanceData.id;
      if (!predictionId) {
        document.getElementById("status").innerText = "❌ No prediction ID returned.";
        return;
      }

      // Step 2: Keep checking until done
      let done = false;
      let outputImage = null;

      while (!done) {
        const checkRes = await fetch(`/api/check?id=${predictionId}`);
        const checkData = await checkRes.json();

        if (checkData.status === "succeeded") {
          done = true;
          outputImage = checkData.output[0];
        } else if (checkData.status === "failed") {
          document.getElementById("status").innerText = "❌ Enhancement failed.";
          return;
        } else {
          document.getElementById("status").innerText = `Processing... (${checkData.status})`;
          await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5s
        }
      }

      // Step 3: Show final image
      document.getElementById("outputImage").src = outputImage;
      document.getElementById("status").innerText = "✅ Done!";

    } catch (err) {
      console.error(err);
      document.getElementById("status").innerText = "❌ Failed to connect to API.";
    }
  };

  reader.readAsDataURL(file);
});
