from django.urls import path
from . import views

urlpatterns = [
    # Homepage
    path('', views.index, name='index'),

    # Static pages
    path('about/', views.about, name='about'),
    path('search/', views.search, name='search'),

    # User auth
    path('login/', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('profile/', views.profile, name='profile'),
    path('profilereq/', views.profilereq, name='profilereq'),
    path('logoutreq/', views.logoutreq, name='logout'),

    # Book management
    path('addBook/<int:book_id>/', views.addBook, name='addBook'),
    path('bookDetails/<int:book_id>/', views.bookDetails, name='bookDetails'),
    path('listAdmin/', views.listAdmin, name='listAdmin'),
    path('api/books/', views.get_books, name='get_books'),
    path('api/books/add/', views.add_book, name='add_book'),
    path('api/books/<int:book_id>/', views.delete_book, name='delete_book'),
    path('api/books/update/<int:book_id>/', views.update_book, name='update_book'),
    path('api/borrow/', views.BorrowBook, name="borrowBook"),
    path('api/unborrow/', views.UnborrowBook, name="unborrowBook")

    # path('api/books/update', views.update_book, name='update_book'),
]