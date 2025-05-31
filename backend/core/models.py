from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class Book(models.Model):
    # Basic book details
    name = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    genre = models.CharField(max_length=50)
    
    # Cover image (URL or FileField for uploads)
    cover = models.URLField(max_length=500, blank=True)  # For remote images
    # OR for local uploads:
    # cover = models.ImageField(upload_to='book_covers/', blank=True)
    
    description = models.TextField()
    rating = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    reviews = models.PositiveIntegerField(default=0)
    language = models.CharField(max_length=50, default="English")
    release_date = models.DateField()  # Stored as YYYY-MM-DD
    is_available = models.BooleanField(default=True)
    
    # JSON field for nested data (Django 3.1+)
    history = models.JSONField(default=dict, blank=True)  # Stores {'borrowed': 500, 'wishlisted': 200}
    
    def __str__(self):
        return f"{self.name} by {self.author} ({self.year})"

    class Meta:
        ordering = ['-year']  # Newest books first

class Reader(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    password = models.CharField(max_length=300)
    email = models.EmailField(unique=True)
    profile_pic = models.ImageField(
        upload_to='reader_profiles/',
        default='reader_profiles/default.png'
    )
    joined_date = models.DateTimeField(default=timezone.now)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class ReaderBook(models.Model):
    STATUS_CHOICES = [
        ('borrowed', 'Borrowed'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
        ('pending', 'Pending'),
    ]
    
    reader = models.ForeignKey(Reader, on_delete=models.CASCADE, related_name='borrowed_books')
    book = models.ForeignKey('Book', on_delete=models.CASCADE)
    return_date = models.DateField()
    is_returned = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='borrowed')
    
    class Meta:
        ordering = ['-return_date']
    
    def __str__(self):
        return f"{self.reader}'s {self.book.name} (Status: {self.status})"
