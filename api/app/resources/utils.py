def pagination_query(model, page: int, per_page: int) -> tuple[list, dict]:
    pagination_result = model.query.paginate(page=page, per_page=per_page)
    return pagination_result.items, {
        "page": pagination_result.page,
        "per_page": pagination_result.per_page,
        "total_pages": pagination_result.pages,
        "total_items": pagination_result.total,
    }
