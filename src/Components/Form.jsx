import React, { useState } from "react";
import ProductSelector from "./ProductSelector"; // Assuming this file is named ProductSelector.js
import { productData } from "../Data/data";
const Form = () => {
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceNumber, setReferenceNumber] = useState(""); // State to store the reference number
  const [firstPage, setFirstPage] = useState(true); // Track if we are on the first or second page
  const [selectedProducts, setSelectedProducts] = useState({}); // Store selected products, barcodes, and quantities
  const [complete, setComplete] = useState(false); // Track if the form submission is complete

  // Generate a reference number based on company and account
  const generateReferenceNumber = () => {
    const companySegment = companyName.replace(/\s+/g, "").slice(0, 4).toUpperCase();
    const now = new Date();
    const hoursSegment = String(now.getHours()).padStart(2, "0"); // Get hours in 24-hour format
    const minutesSegment = String(now.getMinutes()).padStart(2, "0"); // Get minutes and format to 2 digits

    return `${companySegment}-${hoursSegment}${minutesSegment}`; // Combine hours and minutes
  };

  // Handle submission of the initial form (company and contact details)
  const handleNext = e => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    setFirstPage(false); // Move to product selection page after submitting
  };

  // Handle final submission of the product form
  const handleFinalSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const reference = generateReferenceNumber();
    setReferenceNumber(reference);

    // Prepare the data for submission
    const selectedProductsArray = [];

    // Loop through all available products from productData to ensure consistent order
    productData.forEach(({ brand, product: productName, color, sku }) => {
      const product = selectedProducts[brand]?.[productName]; // Check if the product has been selected
      const quantities = product?.quantities || {}; // Quantities for each color if selected

      const quantityForColor = quantities[color]?.quantity || 0; // If not selected, default to 0
      const skuForColor = quantities[color]?.sku || "-"; // If no SKU, default to "-"

      // Add product data to the array (even if not selected)
      selectedProductsArray.push({
        title: productName, // Product name
        color: color, // Color name
        sku: skuForColor, // SKU (or "-" if not selected)
        quantity: quantityForColor, // Quantity (or 0 if not selected)
        brand: brand
      });
    });

    // Prepare the row data for submission
    const data = {
      referenceNumber: reference,
      companyName,
      contactPerson,
      contactEmail,
      selectedProducts: selectedProductsArray // Structure the selected products data
    };

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbykfmY-bwaV_323i93t6KzBc5lbleyWYls_IdvaDTIfG_30xyUPO_hAkkz3eW6sr0omAw/exec", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8" // Set the Content-Type header
        },
        body: JSON.stringify(data), // Stringify the data object
        redirect: "follow" // Follow the redirect response
      });

      if (response.ok) {
        setSuccessMessage(
          "Response submitted successfully! Please make a note of this reference number and check your email for the next steps. If you do not see the email, please check your spam folder."
        );
        // Reset fields
        setCompanyName("");
        setContactPerson("");
        setContactEmail("");
        setSelectedProducts({});
        setFirstPage(true); // Reset the form to first page after successful submission
        setErrorMessage("");
        setComplete(true);
      } else {
        setErrorMessage("There was an issue submitting the response.");
      }
    } catch (error) {
      setErrorMessage("Error submitting the response. Please try again.");
      console.error("Error details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back to the first form (company and contact details)
  const handleBack = () => {
    setFirstPage(true);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg my-6">
      <h1 className="text-2xl font-bold mb-6">Returns - Non-Compliant Products</h1>
      <p className="text-base mb-4">
        Complete this form to return products following the <strong>October 1 Legislation changes</strong>.{" "}
        <a
          target="_blank"
          href="https://www.health.govt.nz/news/vaping-regulations-coming-into-effect-1-october#:~:text=The%20deadline%20for%20all%20vaping,be%20sold%20from%20this%20date."
          className="text-blue-600 underline"
          rel="noreferrer"
        >
          Learn more
        </a>
      </p>
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
          <br />
          <p>
            Reference Number: <strong>{referenceNumber}</strong>
          </p>
        </div>
      )}
      {errorMessage && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{errorMessage}</div>}
      {!complete && (
        <form onSubmit={firstPage ? handleNext : handleFinalSubmit}>
          {firstPage ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="companyName">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter your company name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="contactPerson">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter the contact person's name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="contactEmail">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter the contact email"
                  required
                />
              </div>
              <div className="text-right">
                <button type="submit" className={`px-4 py-2 text-white bg-blue-600 rounded ${isSubmitting ? "opacity-50" : ""}`} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Next"}
                </button>
              </div>
            </>
          ) : (
            <>
              <ProductSelector selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />
              <div className="flex justify-between mt-4">
                <button type="button" onClick={handleBack} className="px-4 py-2 text-white bg-gray-600 rounded">
                  Back
                </button>
                <button type="submit" className={`px-4 py-2 text-white bg-blue-600 rounded ${isSubmitting ? "opacity-50" : ""}`} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default Form;
