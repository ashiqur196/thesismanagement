// facultyRegistration.js
// Script to register faculty accounts from a JSON file

// Configuration
const API_BASE_URL = "http://localhost:8080"; // Replace with your API base URL
const REGISTER_ENDPOINT = "/auth/register"; // Replace with your register endpoint
const JSON_FILE_PATH = "./faculty.json"; // Path to your JSON file

/**
 * Register a single faculty member
 * @param {Object} faculty - Faculty data
 * @returns {Promise<Object>} - API response
 */
async function registerFaculty(faculty) {
  try {
    const response = await fetch(`${API_BASE_URL}${REGISTER_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: faculty.name,
        email: faculty.email,
        password: faculty.password,
        role: "FACULTY", // Fixed role for all faculty
        department: faculty.department,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data, faculty: faculty.name };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      faculty: faculty.name,
    };
  }
}

/**
 * Main function to load JSON and register all faculty
 */
async function registerAllFaculty() {
  try {
    // Load the JSON file
    const response = await fetch(JSON_FILE_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load JSON file: ${response.status}`);
    }

    const data = await response.json();
    const faculties = data.faculties;

    console.log(`Found ${faculties.length} faculty members to register`);

    // Register each faculty member
    const results = [];
    for (const faculty of faculties) {
      console.log(`Registering ${faculty.name}...`);
      const result = await registerFaculty(faculty);
      results.push(result);

      // Add a small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Display results
    console.log("\n--- Registration Results ---");
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log("\nFailed registrations:");
      failed.forEach((f) => {
        console.log(`- ${f.faculty}: ${f.error}`);
      });
    }
  } catch (error) {
    console.error("Error in registration process:", error.message);
  }
}

// Run the registration if this script is executed directly
// Note: This will only work if running in a environment that supports top-level await
// For Node.js, you might need to wrap this in an async function
if (typeof window === "undefined") {
  // Node.js environment
  const fs = require("fs").promises;

  // Override the fetch for JSON loading in Node.js
  async function loadJsonNode(path) {
    try {
      const data = await fs.readFile(path, "utf8");
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load JSON file: ${error.message}`);
    }
  }

  // Node.js compatible registerAllFaculty function
  async function registerAllFacultyNode() {
    try {
      const data = await loadJsonNode(JSON_FILE_PATH);
      const faculties = data.faculties;

      console.log(`Found ${faculties.length} faculty members to register`);

      // Register each faculty member
      const results = [];
      for (const faculty of faculties) {
        console.log(`Registering ${faculty.name}...`);
        const result = await registerFaculty(faculty);
        results.push(result);

        // Add a small delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Display results
      console.log("\n--- Registration Results ---");
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      console.log(`Successful: ${successful.length}`);
      console.log(`Failed: ${failed.length}`);

      if (failed.length > 0) {
        console.log("\nFailed registrations:");
        failed.forEach((f) => {
          console.log(`- ${f.faculty}: ${f.error}`);
        });
      }
    } catch (error) {
      console.error("Error in registration process:", error.message);
    }
  }

  // Execute if run directly in Node.js
  if (require.main === module) {
    registerAllFacultyNode();
  }

  module.exports = { registerAllFacultyNode };
} else {
  // Browser environment - expose function to global scope
  window.registerAllFaculty = registerAllFaculty;
}
