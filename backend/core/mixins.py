"""
Pydantic validation mixin for DRF views.
Provides a consistent validation layer using Pydantic schemas.
"""
from rest_framework.response import Response
from rest_framework import status
from pydantic import ValidationError


class PydanticValidationMixin:
    """
    Mixin that adds Pydantic validation to DRF ViewSets.
    
    Usage:
        class MyViewSet(PydanticValidationMixin, viewsets.ModelViewSet):
            pydantic_create_schema = MyCreateSchema
            pydantic_update_schema = MyUpdateSchema
    """
    pydantic_create_schema = None
    pydantic_update_schema = None

    def validate_with_pydantic(self, schema_class, data):
        """
        Validate request data with a Pydantic schema.
        Returns (validated_data_dict, None) on success.
        Returns (None, error_response) on failure.
        """
        try:
            validated = schema_class(**data)
            return validated.model_dump(exclude_unset=True, by_alias=False), None
        except ValidationError as e:
            errors = {}
            for error in e.errors():
                field = error['loc'][0] if error['loc'] else 'non_field_errors'
                errors[field] = error['msg']
            return None, Response(errors, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        """Override create to add Pydantic validation."""
        if self.pydantic_create_schema:
            validated_data, error_response = self.validate_with_pydantic(
                self.pydantic_create_schema, request.data
            )
            if error_response:
                return error_response
            # Replace request data with validated data
            request._full_data = validated_data
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Override update to add Pydantic validation."""
        if self.pydantic_update_schema:
            validated_data, error_response = self.validate_with_pydantic(
                self.pydantic_update_schema, request.data
            )
            if error_response:
                return error_response
            request._full_data = validated_data
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to add Pydantic validation."""
        if self.pydantic_update_schema:
            validated_data, error_response = self.validate_with_pydantic(
                self.pydantic_update_schema, request.data
            )
            if error_response:
                return error_response
            request._full_data = validated_data
        return super().partial_update(request, *args, **kwargs)
