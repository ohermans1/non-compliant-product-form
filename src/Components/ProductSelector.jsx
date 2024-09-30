import React, { useState } from "react";
import { productData } from "../Data/data";

const ProductSelector = ({ selectedProducts, setSelectedProducts }) => {
  const [expandedBrands, setExpandedBrands] = useState({});

  // Group products by brand and product name
  const groupedProducts = productData.reduce((acc, product) => {
    const { brand, product: productName, color, sku } = product;

    // Create a structure to group by brand and then by product name
    if (!acc[brand]) {
      acc[brand] = {};
    }
    if (!acc[brand][productName]) {
      acc[brand][productName] = { colors: [] }; // Store colors in an array
    }

    // Ensure colors are unique for each product
    if (!acc[brand][productName].colors.some(existingColor => existingColor.color === color)) {
      acc[brand][productName].colors.push({ color, sku });
    }
    return acc;
  }, {});

  const handleProductSelection = (productName, brand) => {
    setSelectedProducts(prev => {
      const isSelected = !prev[brand]?.[productName]?.selected;

      // Reset all quantities to 0 if the product is being deselected
      const newQuantities = isSelected
        ? {}
        : Object.keys(prev[brand]?.[productName]?.quantities || {}).reduce((acc, color) => {
            acc[color] = { sku: prev[brand][productName].quantities[color].sku, quantity: 0 }; // Reset quantity to 0
            return acc;
          }, {});

      return {
        ...prev,
        [brand]: {
          ...prev[brand],
          [productName]: {
            selected: isSelected,
            quantities: newQuantities // Maintain previous quantities if toggled
          }
        }
      };
    });
  };

  const handleColorChange = (brand, productName, color, sku, value) => {
    setSelectedProducts(prev => {
      const newQuantities = {
        ...prev[brand][productName]?.quantities,
        [color]: {
          sku,
          quantity: value === "" ? 0 : value // Reset to 0 if the input is empty
        }
      };

      return {
        ...prev,
        [brand]: {
          ...prev[brand],
          [productName]: {
            ...prev[brand][productName],
            quantities: newQuantities
          }
        }
      };
    });
  };

  const toggleBrandExpansion = brand => {
    setExpandedBrands(prev => ({
      ...prev,
      [brand]: !prev[brand]
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select Products</h2>
      <p className="text-base mb-4">Please select the products you wish to return and specify the quantities for each colour below.</p>
      {Object.keys(groupedProducts).map(brand => (
        <div key={brand} className="mb-4 border-b">
          <h3 className="cursor-pointer text-lg font-semibold flex justify-between items-center" onClick={() => toggleBrandExpansion(brand)}>
            <span>{brand}</span>
            <span>
              {expandedBrands[brand] ? "▼" : "▲"} {/* Downward or upward chevron */}
            </span>
          </h3>
          {expandedBrands[brand] && (
            <div className="ml-4 mt-2">
              {Object.keys(groupedProducts[brand]).map(productName => (
                <div key={productName} className="mb-4">
                  <label className="block text-md font-medium mb-1 flex items-center">
                    <input
                      type="checkbox"
                      onChange={() => handleProductSelection(productName, brand)}
                      checked={selectedProducts[brand]?.[productName]?.selected || false}
                      className="mr-2" // Space between checkbox and text
                    />
                    <span className="font-semibold">{productName}</span>
                  </label>
                  {selectedProducts[brand]?.[productName]?.selected && (
                    <div className="ml-6 mt-2">
                      <p className="text-sm font-medium">Select Color and Quantity:</p>
                      {/* Render color options for the product */}
                      {groupedProducts[brand][productName].colors.map(({ color, sku }) => (
                        <div key={sku} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts[brand]?.[productName]?.quantities[color]?.quantity > 0 || false} // Check if quantity is greater than 0
                            onChange={e => {
                              const isChecked = e.target.checked;
                              if (!isChecked) {
                                // If unchecked, reset quantity to 0
                                handleColorChange(brand, productName, color, sku, "0");
                              } else {
                                // If checked, set quantity to 1 if no value is present
                                const currentQuantity = selectedProducts[brand]?.[productName]?.quantities[color]?.quantity;
                                handleColorChange(brand, productName, color, sku, currentQuantity > 0 ? currentQuantity : "1");
                              }
                            }}
                            className="mr-2"
                          />
                          <span>{color}</span>
                          <input
                            type="number"
                            placeholder="Qty"
                            value={selectedProducts[brand]?.[productName]?.quantities[color]?.quantity || ""}
                            onChange={e => handleColorChange(brand, productName, color, sku, e.target.value)}
                            className="ml-2 w-16 border border-gray-300 rounded p-1"
                            min="0"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductSelector;
