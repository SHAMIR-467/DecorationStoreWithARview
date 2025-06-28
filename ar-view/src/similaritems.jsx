// src/routes/SimilarItemsRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
const SimilarItemsRoutes = () => {
  return (
    <>
      <Route path="/purchase-guide" element={<div>Purchase Guide Page</div>} />
      <Route path="/terms-policy" element={<div>Terms of Policy Page</div>} />
      <Route path="/similar-items/wall-art" element={<div>Wall Art Page</div>} />
      <Route path="/similar-items/rugs-carpets" element={<div>Rugs & Carpets Page</div>} />
      <Route path="/similar-items/curtains-drapes" element={<div>Curtains & Drapes Page</div>} />
      <Route path="/similar-items/indoor-plants" element={<div>Indoor Plants Page</div>} />
      <Route path="/similar-items/lighting-fixtures" element={<div>Lighting Fixtures Page</div>} />
      <Route path="/similar-items/decorative-accessories" element={<div>Decorative Accessories Page</div>} />
      <Route path="/similar-items/desk-organizers" element={<div>Desk Organizers Page</div>} />
      <Route path="/similar-items/wall-clocks" element={<div>Wall Clocks Page</div>} />
      <Route path="/similar-items/inspirational-posters" element={<div>Inspirational Posters Page</div>} />
      <Route path="/similar-items/office-plants" element={<div>Office Plants Page</div>} />
      <Route path="/similar-items/shelving-units" element={<div>Shelving Units Page</div>} />
      <Route path="/similar-items/lighting-solutions" element={<div>Lighting Solutions Page</div>} />
      <Route path="/similar-items/holiday-decorations" element={<div>Holiday Decorations Page</div>} />
      <Route path="/similar-items/seasonal-wreaths" element={<div>Seasonal Wreaths Page</div>} />
      <Route path="/similar-items/outdoor-decor" element={<div>Outdoor Decor Page</div>} />
      <Route path="/similar-items/themed-decorations" element={<div>Themed Decorations Page</div>} />
      <Route path="/similar-items/garden-statues" element={<div>Garden Statues Page</div>} />
      <Route path="/similar-items/patio-furniture" element={<div>Patio Furniture Page</div>} />
      <Route path="/similar-items/outdoor-lighting" element={<div>Outdoor Lighting Page</div>} />
      <Route path="/similar-items/planters" element={<div>Planters Page</div>} />
      <Route path="/similar-items/decorative-fencing" element={<div>Decorative Fencing Page</div>} />
    </>
  );
};

export default SimilarItemsRoutes;
