import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCompare,
  clearCompare,
  setComparisonDetails,
} from "../../assets/reducx/slices/compareSlice";
import {
  FaSpinner,
  FaTrash,
  FaCompressAlt,
  FaTable,
  FaChartBar,
  FaColumns,
} from "react-icons/fa";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import GiphyEmbed from "../../assets/css/loader";

const ComparePage = () => {
  const { items: compareItems = [], comparisonDetails = {} } =
    useSelector((state) => state.compare) || {};
  const dispatch = useDispatch();
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState({});
  const [comparisonMetrics, setComparisonMetrics] = useState({});
  const [formattedResponse, setFormattedResponse] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid', 'table', or 'split'

  useEffect(() => {
    if (compareItems.length > 0) {
      setSelectedItems(compareItems);

      // Fetch product details for each item
      const fetchAllProductDetails = async () => {
        setLoading(true);
        try {
          const details = {};

          for (const item of compareItems) {
            try {
              const response = await axios.get(`/api/product/${item.id}`);
              if (response.data && response.data.success) {
                details[item.id] = response.data.product;
              }
            } catch (err) {
              console.error(`Error fetching product ${item.id}:`, err);
              // We'll continue with other products even if one fails
            }
          }

          setProductDetails(details);
        } catch (err) {
          console.error("Error in product fetching process:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAllProductDetails();
    }
  }, [compareItems]);

  const getProductDetail = useCallback(
    (id) => {
      return productDetails[id] || null;
    },
    [productDetails]
  );

  const fetchAIComparisonData = async () => {
    if (selectedItems.length === 0) return;

    const prompt = generatePrompt(selectedItems);
    const genAI = new GoogleGenerativeAI(
      "AIzaSyDXwkZr8HQnKU24amKNn1o5udaxASZ6x4o"
    );
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
      setLoading(true);
      const result = await model.generateContent(prompt);
      const comparisonResult = await result.response.text();
      const formatted = formatAIResponse(comparisonResult);
      setFormattedResponse(formatted);
      processComparisonResult(comparisonResult);
    } catch (e) {
      console.error("Error fetching comparison data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTableData = (responseText) => {
    try {
      // Extract the table data from between the markers
      const tableMatch = responseText.match(
        /\|\|TABLE_START\|\|([\s\S]*?)\|\|TABLE_END\|\|/
      );

      if (!tableMatch) return null;

      const tableContent = tableMatch[1].trim();
      const rows = tableContent.split("\n");

      // Parse header row
      const headers = rows[0]
        .split("|")
        .map((h) => h.trim())
        .filter((h) => h);

      // Parse data rows
      const tableData = rows
        .slice(2)
        .map((row) => {
          const cells = row
            .split("|")
            .map((cell) => cell.trim())
            .filter((c) => c);
          return cells;
        })
        .filter((row) => row.length > 0);

      // Create a styled table
      return (
        <div className="overflow-auto my-6">
          <table className="min-w-full bg-white border-collapse shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-blue-500 text-white">
              <tr>
                {headers.map((header, idx) => (
                  <th key={`header-${idx}`} className="p-3 border text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIdx) => (
                <tr
                  key={`row-${rowIdx}`}
                  className={rowIdx % 2 === 0 ? "bg-blue-50" : "bg-white"}
                >
                  {row.map((cell, cellIdx) => (
                    <td
                      key={`cell-${rowIdx}-${cellIdx}`}
                      className="p-3 border"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } catch (error) {
      console.error("Error parsing table data:", error);
      return <p>Error parsing table data</p>;
    }
  };

  const fetchPriceData = (query) => {
    // Implementation for fetching price data if needed
    console.log("Price comparison requested for:", query);
    // This would normally make an API call to get pricing information
  };

  const formatBulletPoint = (line, index) => {
    const content = line.substring(2);
    return (
      <div key={`bullet-${index}`} className="flex items-start space-x-2 my-1">
        <span className="text-blue-500 mt-1">•</span>
        <span className="pl-2">
          {
            formatInlineStyling(content, `bullet-content-${index}`).props
              .children
          }
        </span>
      </div>
    );
  };

  const formatDash = (line, index) => {
    const content = line.substring(2);
    return (
      <div key={`dash-${index}`} className="flex items-start space-x-2 my-1">
        <span className="text-blue-500 mt-1">-</span>
        <span className="pl-2">
          {formatInlineStyling(content, `dash-content-${index}`).props.children}
        </span>
      </div>
    );
  };

  const formatAIResponse = (responseText) => {
    if (!responseText) return [];

    // Check if response contains tabular data markers
    if (
      responseText.includes("||TABLE_START||") &&
      responseText.includes("||TABLE_END||")
    ) {
      return handleTableData(responseText);
    }

    // Check if response contains price comparison request
    if (responseText.includes("||PRICE_COMPARE:")) {
      const priceMatch = responseText.match(/\|\|PRICE_COMPARE:(.*?)\|\|/);
      if (priceMatch && priceMatch[1]) {
        const query = priceMatch[1].trim();
        fetchPriceData(query);
      }
    }

    // Convert markdown tables to HTML tables
    if (responseText.includes("|") && responseText.includes("---")) {
      const lines = responseText.split("\n");
      const tableStartIndices = [];
      const tableEndIndices = [];

      // Find table boundaries
      let inTable = false;
      lines.forEach((line, idx) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
          if (!inTable) {
            tableStartIndices.push(idx);
            inTable = true;
          }
        } else if (inTable) {
          tableEndIndices.push(idx - 1);
          inTable = false;
        }
      });

      // If we're still in a table at the end of processing
      if (inTable) {
        tableEndIndices.push(lines.length - 1);
      }

      // Process each table
      for (let i = 0; i < tableStartIndices.length; i++) {
        const start = tableStartIndices[i];
        const end = tableEndIndices[i];

        // Extract and process the table
        const tableLines = lines.slice(start, end + 1);
        const tableContent = processMarkdownTable(tableLines);

        // Replace the table in the original response
        lines.splice(start, end - start + 1, tableContent);

        // Adjust indices for subsequent tables
        for (let j = i + 1; j < tableStartIndices.length; j++) {
          tableStartIndices[j] -= end - start;
          tableEndIndices[j] -= end - start;
        }
      }

      // Reassemble the response with tables processed
      responseText = lines.join("\n");
    }

    const lines = responseText.split("\n");
    const formatted = lines.map((line, index) => {
      // Skip empty lines
      if (!line.trim()) {
        return <br key={`br-${index}`} />;
      }

      // Handle headers
      if (line.startsWith("####")) {
        return (
          <h4
            key={`h4-${index}`}
            className="font-bold text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md mb-2"
          >
            {
              formatInlineStyling(line.slice(4).trim(), `h4-content-${index}`)
                .props.children
            }
          </h4>
        );
      }

      if (line.startsWith("###")) {
        return (
          <h3
            key={`h3-${index}`}
            className="font-bold text-lg text-gray-700 bg-gray-100 px-3 py-1.5 rounded-md mb-3"
          >
            {
              formatInlineStyling(line.slice(3).trim(), `h3-content-${index}`)
                .props.children
            }
          </h3>
        );
      }

      if (line.startsWith("##")) {
        return (
          <h2
            key={`h2-${index}`}
            className="font-bold text-xl text-gray-800 bg-gray-100 px-4 py-2 rounded-md mb-3"
          >
            {
              formatInlineStyling(line.slice(2).trim(), `h2-content-${index}`)
                .props.children
            }
          </h2>
        );
      }

      if (line.startsWith("#")) {
        return (
          <h1
            key={`h1-${index}`}
            className="font-bold text-2xl text-gray-900 bg-gray-100 px-4 py-2 rounded-md mb-4"
          >
            {
              formatInlineStyling(line.slice(1).trim(), `h1-content-${index}`)
                .props.children
            }
          </h1>
        );
      }

      // Handle bullet points
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("* ")) {
        return formatBulletPoint(trimmedLine, index);
      }

      if (trimmedLine.startsWith("- ")) {
        return formatDash(trimmedLine, index);
      }

      if (trimmedLine.startsWith("> ")) {
        return (
          <blockquote
            key={`quote-${index}`}
            className="border-l-4 border-blue-500 pl-4 py-1 my-2 bg-blue-50 rounded-r-md italic"
          >
            {
              formatInlineStyling(
                trimmedLine.slice(2),
                `quote-content-${index}`
              ).props.children
            }
          </blockquote>
        );
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        const number = trimmedLine.match(/^\d+/)[0];
        const content = trimmedLine.replace(/^\d+\.\s/, "");

        return (
          <div
            key={`num-${index}`}
            className="flex items-start space-x-2 my-1 pl-2"
          >
            <span className="font-bold text-blue-600 min-w-6 text-right">
              {number}.
            </span>
            <span className="pl-2">
              {
                formatInlineStyling(content, `num-content-${index}`).props
                  .children
              }
            </span>
          </div>
        );
      }

      // Regular paragraph
      return (
        <p key={`p-${index}`} className="my-2 leading-relaxed">
          {formatInlineStyling(line, `p-content-${index}`).props.children}
        </p>
      );
    });

    return formatted;
  };

  // Process markdown table to JSX
  const processMarkdownTable = (tableLines) => {
    // Filter out separator row
    const contentRows = tableLines.filter((line) => !line.includes("---"));

    // Parse headers
    const headerRow = contentRows[0];
    const headers = headerRow
      .split("|")
      .filter((cell) => cell.trim())
      .map((cell) => cell.trim());

    // Parse data rows
    const dataRows = contentRows.slice(1).map((row) =>
      row
        .split("|")
        .filter((cell) => cell.trim())
        .map((cell) => cell.trim())
    );

    // Return JSX table
    return (
      <div className="overflow-auto my-4">
        <table className="min-w-full bg-white border-collapse shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-blue-500 text-white">
            <tr>
              {headers.map((header, idx) => (
                <th key={`header-${idx}`} className="p-3 border text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => (
              <tr
                key={`row-${rowIdx}`}
                className={rowIdx % 2 === 0 ? "bg-blue-50" : "bg-white"}
              >
                {row.map((cell, cellIdx) => (
                  <td key={`cell-${rowIdx}-${cellIdx}`} className="p-3 border">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Handle inline styling (bold, italics, etc.)
  const formatInlineStyling = (text, key) => {
    if (!text) return <span key={key}></span>;

    // Process the text to handle inline formatting
    const styleMap = [
      { pattern: /\*\*(.*?)\*\*/g, type: "bold", className: "font-bold" },
      { pattern: /\*(.*?)\*/g, type: "italic", className: "italic" },
      { pattern: /__(.*?)__/g, type: "underline", className: "underline" },
      {
        pattern: /~~(.*?)~~/g,
        type: "strikethrough",
        className: "line-through",
      },
      {
        pattern: /==(.*?)==/g,
        type: "highlight",
        className: "bg-yellow-200 px-1 rounded",
      },
      {
        pattern: /`(.*?)`/g,
        type: "code",
        className: "bg-gray-100 px-1 font-mono rounded",
      },
    ];

    // Tokenize the text based on all patterns
    let tokens = [{ type: "text", content: text }];

    for (const style of styleMap) {
      const { pattern, type } = style;
      let newTokens = [];

      for (const token of tokens) {
        if (token.type === "text") {
          let lastIndex = 0;
          let match;
          let tokenContent = token.content;

          pattern.lastIndex = 0; // Reset regex state

          while ((match = pattern.exec(tokenContent)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
              newTokens.push({
                type: "text",
                content: tokenContent.substring(lastIndex, match.index),
              });
            }

            // Add the styled content
            newTokens.push({
              type: type,
              content: match[1],
            });

            lastIndex = match.index + match[0].length;
          }

          // Add any remaining text
          if (lastIndex < tokenContent.length) {
            newTokens.push({
              type: "text",
              content: tokenContent.substring(lastIndex),
            });
          }
        } else {
          // Pass through already processed tokens
          newTokens.push(token);
        }
      }

      tokens = newTokens;
    }

    // Convert tokens to React elements
    return (
      <span key={key}>
        {tokens.map((token, idx) => {
          const style = styleMap.find((s) => s.type === token.type);

          if (style) {
            return (
              <span key={`${key}-${idx}`} className={style.className}>
                {token.content}
              </span>
            );
          }

          return <span key={`${key}-text-${idx}`}>{token.content}</span>;
        })}
      </span>
    );
  };

  const processComparisonResult = (result) => {
    const metrics = extractMetrics(result);
    setComparisonMetrics(metrics);

    const updatedComparisonDetails = { ...comparisonDetails };
    selectedItems.forEach((item) => {
      updatedComparisonDetails[item.id] = {
        result,
        metrics: metrics[item.id],
      };
    });
    dispatch(setComparisonDetails(updatedComparisonDetails));
  };

  const extractMetrics = (result) => {
    // In a real implementation, this would parse the AI response to extract actual metrics
    // Here we'll use a more sophisticated mock approach
    const metrics = {};

    selectedItems.forEach((item) => {
      // Extract values based on mentions in the AI result text
      const itemDetail = getProductDetail(item.id);
      const name = itemDetail?.productName || `Product ${item.id}`;

      // More intelligent metric generation based on the result text
      const nameOccurrences = (result.match(new RegExp(name, "gi")) || [])
        .length;

      metrics[item.id] = {
        performance: 50 + nameOccurrences * 5 + Math.random() * 20,
        value: itemDetail?.price
          ? 100 - itemDetail.price / 20
          : 50 + Math.random() * 30,
        features: itemDetail?.features?.length
          ? itemDetail.features.length * 10
          : 40 + Math.random() * 30,
      };
    });

    return metrics;
  };

  const generatePrompt = useCallback(
    (items) => {
      const itemDetails = items
        .map((i) => {
          const details = getProductDetail(i.id);
          if (!details) return `Product ID: ${i.id}`;

          return `${details.productName} (Price: ${
            details.price
          }, Features: ${details.features?.join(", ")})`;
        })
        .join("\n");

      return `Compare these products in detail:\n${itemDetails}\n\n
    Provide a comprehensive analysis including:
    1. Price comparison with a detailed breakdown of value
    2. Feature-by-feature comparison in tabular format
    3. Performance metrics for each product
    4. Overall value proposition highlighting strengths and weaknesses
    5. Recommendations for different types of users (budget-conscious, performance-focused, etc.)
    
    Structure your response clearly with headings for each section.
    Focus on objective data and avoid brand bias.
    You can use markdown tables for feature comparison.`;
    },
    [getProductDetail]
  );

  const handleRemoveFromCompare = useCallback(
    (id) => {
      dispatch(removeFromCompare({ id }));
      setSelectedItems((prev) => prev.filter((item) => item.id !== id));
      setComparisonMetrics((prev) => {
        const newMetrics = { ...prev };
        delete newMetrics[id];
        return newMetrics;
      });
    },
    [dispatch]
  );

  const handleClearCompare = useCallback(() => {
    dispatch(clearCompare());
    setSelectedItems([]);
    setComparisonMetrics({});
    setFormattedResponse("");
  }, [dispatch]);

  // Tabular view for product comparison
  const renderTableView = () => {
    const allFeatures = new Set();

    // Collect all unique features across products
    selectedItems.forEach((item) => {
      const details = getProductDetail(item.id);
      if (details && details.features) {
        details.features.forEach((feature) => allFeatures.add(feature));
      }
    });

    return (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border-collapse shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-4 border">Feature</th>
              {selectedItems.map((item) => {
                const details = getProductDetail(item.id);
                return (
                  <th key={item.id} className="p-4 border">
                    {details?.productName || `Product ${item.id}`}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-blue-100">
              <td className="p-3 border font-semibold">Price</td>
              {selectedItems.map((item) => {
                const details = getProductDetail(item.id);
                return (
                  <td key={item.id} className="p-3 border text-center">
                    {details?.price ? `Rs ${details.price.toFixed(2)}` : "N/A"}
                  </td>
                );
              })}
            </tr>

            {/* Feature comparison rows */}
            {Array.from(allFeatures).map((feature, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <td className="p-3 border font-medium">{feature}</td>
                {selectedItems.map((item) => {
                  const details = getProductDetail(item.id);
                  const hasFeature = details?.features?.includes(feature);

                  return (
                    <td key={item.id} className="p-3 border text-center">
                      {hasFeature ? (
                        <span className="text-green-500 font-bold">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Performance metrics if available */}
            {Object.keys(comparisonMetrics).length > 0 && (
              <>
                <tr className="bg-blue-100">
                  <td className="p-3 border font-semibold">
                    Performance Score
                  </td>
                  {selectedItems.map((item) => (
                    <td key={item.id} className="p-3 border text-center">
                      {comparisonMetrics[item.id]?.performance.toFixed(1)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-100">
                  <td className="p-3 border font-semibold">Value Score</td>
                  {selectedItems.map((item) => (
                    <td key={item.id} className="p-3 border text-center">
                      {comparisonMetrics[item.id]?.value.toFixed(1)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50">
                  <td className="p-3 border font-semibold">Features Score</td>
                  {selectedItems.map((item) => (
                    <td key={item.id} className="p-3 border text-center">
                      {comparisonMetrics[item.id]?.features.toFixed(1)}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Split view for side-by-side comparison
  const renderSplitView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 mt-4">
        {selectedItems.map((item, index) => {
          const itemDetails = getProductDetail(item.id);
          if (!itemDetails) return null;

          // Determine background color based on metrics (if available)
          let bgColorClass = index % 2 === 0 ? "bg-blue-50" : "bg-gray-50";
          if (comparisonMetrics[item.id]) {
            const totalScore =
              comparisonMetrics[item.id].performance +
              comparisonMetrics[item.id].value +
              comparisonMetrics[item.id].features;

            if (totalScore > 200) bgColorClass = "bg-green-50";
            else if (totalScore < 150) bgColorClass = "bg-red-50";
          }

          return (
            <div
              key={item.id}
              className={`border-r border-gray-300 p-6 h-full ${bgColorClass} flex flex-col`}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {itemDetails.productName}
                </h2>
                <button
                  onClick={() => handleRemoveFromCompare(item.id)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                >
                  <FaTrash size={14} />
                </button>
              </div>

              {itemDetails.images && itemDetails.images[0] && (
                <img
                  src={itemDetails.images[0]?.url}
                  alt={itemDetails.productName}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <div className="text-xl font-bold text-blue-700 mb-4">
                Price: Rs
                {typeof itemDetails.price === "number"
                  ? itemDetails.price.toFixed(2)
                  : "N/A"}
              </div>

              <h3 className="text-lg font-semibold mb-2">Features:</h3>
              <ul className="list-disc list-inside mb-4 flex-grow">
                {itemDetails.features?.map((feature, idx) => (
                  <li key={idx} className="text-gray-700 mb-1">
                    {feature}
                  </li>
                ))}
              </ul>

              {comparisonMetrics[item.id] && (
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">
                    Performance Metrics:
                  </h3>
                  <div className="flex justify-between">
                    <div className="text-center">
                      <div className="font-bold">
                        {comparisonMetrics[item.id].performance.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">
                        {comparisonMetrics[item.id].value.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Value</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">
                        {comparisonMetrics[item.id].features.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Features</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderComparisonChart = () => {
    if (Object.keys(comparisonMetrics).length === 0) return null;

    return (
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-lg shadow-lg text-white">
        <h3 className="text-xl font-bold mb-4">Comparison Chart</h3>
        <div className="flex justify-around">
          {Object.entries(comparisonMetrics).map(([id, metrics]) => {
            const itemDetails = getProductDetail(id);
            return (
              <div key={id} className="text-center">
                <h4 className="font-semibold">
                  {itemDetails?.productName || `Product ${id}`}
                </h4>
                <div className="flex items-end mt-2 space-x-4 h-32">
                  <div className="flex flex-col items-center">
                    <div
                      style={{ height: `${metrics.performance}%` }}
                      className="w-12 bg-blue-300 rounded-t-lg mb-1"
                    ></div>
                    <span className="text-xs mt-1">Performance</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      style={{ height: `${metrics.value}%` }}
                      className="w-12 bg-green-300 rounded-t-lg mb-1"
                    ></div>
                    <span className="text-xs mt-1">Value</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      style={{ height: `${metrics.features}%` }}
                      className="w-12 bg-yellow-300 rounded-t-lg mb-1"
                    ></div>
                    <span className="text-xs mt-1">Features</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Grid view (original card layout)
  // Grid view (original card layout)
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {selectedItems.map((item) => {
          const itemDetails = getProductDetail(item.id);
          if (!itemDetails) return null;

          return (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-4 bg-blue-50">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-800 truncate">
                    {itemDetails.productName}
                  </h2>
                  <button
                    onClick={() => handleRemoveFromCompare(item.id)}
                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>

              {itemDetails.images && itemDetails.images[0] && (
                <img
                  src={itemDetails.images[0]?.url}
                  alt={itemDetails.productName}
                  className="w-full h-40 object-cover"
                />
              )}

              <div className="p-4">
                <div className="text-lg font-bold text-blue-700 mb-3">
                  Price: Rs{" "}
                  {typeof itemDetails.price === "number"
                    ? itemDetails.price.toFixed(2)
                    : "N/A"}
                </div>

                <h3 className="text-md font-semibold mb-2">Features:</h3>
                <ul className="list-disc list-inside mb-4 text-sm">
                  {itemDetails.features?.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-gray-700 mb-1 truncate">
                      {feature}
                    </li>
                  ))}
                  {itemDetails.features?.length > 3 && (
                    <li className="text-blue-600 italic">
                      +{itemDetails.features.length - 3} more
                    </li>
                  )}
                </ul>

                {comparisonMetrics[item.id] && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <div className="font-bold">
                          {comparisonMetrics[item.id].performance.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600">Performance</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">
                          {comparisonMetrics[item.id].value.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600">Value</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">
                          {comparisonMetrics[item.id].features.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600">Features</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Product Comparison
          <span className="ml-2 text-gray-500 text-base">
            ({selectedItems.length} items)
          </span>
        </h1>

        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            title="Grid View"
          >
            <FaCompressAlt />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            title="Table View"
          >
            <FaTable />
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={`p-2 rounded ${
              viewMode === "split"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            title="Split View"
          >
            <FaColumns />
          </button>
        </div>
      </div>

      {selectedItems.length === 0 ? (
        <div className="text-center p-16 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">
            No products selected for comparison
          </p>
          <p className="text-gray-500 mt-2">
            Add products to compare from the product listings
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <button
                onClick={fetchAIComparisonData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 shadow-md transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FaChartBar />
                    <span>Compare with AI</span>
                  </>
                )}
              </button>
              <button
                onClick={handleClearCompare}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 shadow-md transition-all"
              >
                <FaTrash />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* View selector renders the appropriate view */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {viewMode === "grid" && renderGridView()}
            {viewMode === "table" && renderTableView()}
            {viewMode === "split" && renderSplitView()}
          </div>

          {/* Render chart if metrics are available */}
          {Object.keys(comparisonMetrics).length > 0 && renderComparisonChart()}

          {/* Render AI comparison result */}
          {formattedResponse && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                AI Analysis
              </h2>
              <div className="prose max-w-none">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <GiphyEmbed />
                  </div>
                ) : (
                  formattedResponse
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComparePage;
