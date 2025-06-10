from rest_framework.pagination import CursorPagination, PageNumberPagination

class PostCursorPagination(CursorPagination):
    page_size = 5
    ordering = ['-created_at']

class CommentCursorPagination(CursorPagination):
    page_size = 10
    ordering = ['-created_at']
    cursor_query_param = 'cursor'

class DiscoverCursorPagination(CursorPagination):
    page_size = 5
    ordering = ['-score', '-created_at']

class FollowRequestPagination(CursorPagination):
    page_size = 10
    ordering = ['-created_at']

class NotificationPagination(PageNumberPagination):
    page_size = 10
    ordering = ['-created_at']
    max_page_size = 100