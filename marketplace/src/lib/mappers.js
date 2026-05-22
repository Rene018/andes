export function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    material: row.material,
    price: row.price,
    category: row.category,
    targetAudience: row.target_audience,
    stlFilename: row.stl_filename,
    available: row.available,
    inProduction: row.in_production,
    reserved: row.reserved,
    status: row.status,
    printTime: row.print_time,
    totalTime: row.total_time,
    piecesPerUnit: row.pieces_per_unit,
    avgRating: row.avg_rating,
    reviewCount: row.review_count,
  }
}

export function mapReview(row) {
  return {
    id: row.id,
    productId: row.product_id,
    source: row.source,
    reviewer: row.reviewer,
    reviewerType: row.reviewer_type,
    avgRating: row.avg_rating,
    comment: row.comment,
    reviewDate: row.review_date,
  }
}

export function mapMaterial(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    stock: row.stock,
    minStock: row.min_stock,
    maxStock: row.max_stock,
    supplier: row.supplier,
    status: row.status,
  }
}

export function mapOrder(row) {
  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    customerType: row.customer_type,
    institution: row.institution,
    email: row.email,
    phone: row.phone,
    city: row.city,
    items: (row.order_items || []).map(item => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      subtotal: item.subtotal,
    })),
    total: row.total,
    status: row.status,
    notes: row.notes,
    priority: row.priority,
    createdAt: row.created_at,
  }
}
