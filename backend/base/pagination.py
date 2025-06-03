from rest_framework.pagination import CursorPagination

class FeedCursorPagination(CursorPagination):
    page_size = 5
    ordering = '-id'

class CommentCursorPagination(CursorPagination):
    page_size = 10
    ordering = '-id'
    cursor_query_param = 'cursor'

class DiscoverCursorPagination(CursorPagination):
    page_size = 5
    ordering = ('-score', '-id')