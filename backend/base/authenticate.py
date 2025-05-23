from rest_framework_simplejwt.authentication import JWTAuthentication

class CookiesAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return None

        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
        except Exception:
            return None

        request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
        return (user, validated_token)