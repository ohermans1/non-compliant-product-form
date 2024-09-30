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

      // Ensure quantities are maintained and colors reset if product is unselected
      const newQuantities = isSelected ? {} : prev[brand]?.[productName]?.quantities || {};

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
    setSelectedProducts(prev => ({
      ...prev,
      [brand]: {
        ...prev[brand],
        [productName]: {
          ...prev[brand][productName],
          quantities: {
            ...prev[brand][productName]?.quantities,
            [color]: {
              sku,
              quantity: value // Update the quantity for the specific color
            }
          }
        }
      }
    }));
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
      {Object.keys(groupedProducts).map(brand => (
        <div key={brand} className="mb-4 border-b">
          <h3 className="cursor-pointer text-lg font-semibold" onClick={() => toggleBrandExpansion(brand)}>
            {brand}
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
                            checked={selectedProducts[brand]?.[productName]?.quantities[color] !== undefined}
                            onChange={() => handleColorChange(brand, productName, color, sku, selectedProducts[brand]?.[productName]?.quantities[color]?.quantity || "")}
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
