from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.filter(email=username).first()
        except UserModel.DoesNotExist:
            return None
        else:
            if user and user.check_password(password):
                return user
        return None
