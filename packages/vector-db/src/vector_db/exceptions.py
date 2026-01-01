"""
Vector DB - Exceptions
======================
Custom exceptions for vector database operations.
"""


class VectorDBError(Exception):
    """Base exception for vector DB operations."""
    
    def __init__(
        self,
        message: str,
        provider: str | None = None,
        collection: str | None = None,
        **kwargs,
    ):
        super().__init__(message)
        self.message = message
        self.provider = provider
        self.collection = collection
        self.details = kwargs


class VectorDBConnectionError(VectorDBError):
    """Connection to vector database failed."""
    pass


class CollectionNotFoundError(VectorDBError):
    """Collection/index doesn't exist."""
    pass


class CollectionAlreadyExistsError(VectorDBError):
    """Collection/index already exists."""
    pass


class InvalidVectorDimensionError(VectorDBError):
    """Vector dimension mismatch."""
    pass


class VectorDBQueryError(VectorDBError):
    """Query execution failed."""
    pass
