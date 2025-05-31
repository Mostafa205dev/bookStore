from datetime import date, timedelta
from django.core import serializers
from django.shortcuts import render, get_object_or_404
from .models import Book 
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from .models import ReaderBook

# Create your views here.
def index(request):
    return render(request, 'index.html')
def about(request):
    return render(request, 'about.html')
def addBook(request,book_id):
    return render(request, 'addBook.html', {'book_id': book_id})  # Pass book_id to the template
def bookDetails(request, book_id):  # ✅ Add book_id as a parameter
    book = get_object_or_404(Book, id=book_id)  # Fetch the book or return 404
    return render(request, 'bookDetails.html', {'book': book})
def listAdmin(request):
    return render(request, 'listAdmin.html')
def login(request):
    return render(request, 'login.html')
def profile(request):
    return render(request, 'profile.html')
def search(request):
    return render(request, 'search.html')
def signup(request):
    return render(request, 'signup.html')



def get_books(request):
    books = Book.objects.all()
    data = serializers.serialize('json', books)
    return JsonResponse({'books': data}, safe=False)



@csrf_exempt 
def add_book(request):
    if request.method == 'POST':
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)

            book = Book.objects.create(
                name=data['name'],
                author=data['author'],
                year=int(data.get('year', 1925)),
                genre=data['genre'],
                cover=data.get('cover', ''),
                description=data['description'],
                rating=float(data.get('rating', 0)),
                reviews=int(data.get('reviews', 0)),
                language=data.get('language', 'English'),
                release_date=data.get('release_date', '1925-04-10'),
                is_available=data.get('is_available', True),
                history={}
            )

            return JsonResponse({
                'status': 'success', 
                'book_id': book.id
            })

        except json.JSONDecodeError:
            return JsonResponse(
                {'status': 'error', 'message': 'Invalid JSON data'}, 
                status=400
            )
        except Exception as e:
            return JsonResponse(
                {'status': 'error', 'message': str(e)}, 
                status=500
            )

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def delete_book(request, book_id):
    if request.method == 'DELETE':
        try:
            book = Book.objects.get(id=book_id)
            book.delete()
            return JsonResponse({'status': 'success'})
        except Book.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Book not found'}, status=404)
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def update_book(request, book_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            book = get_object_or_404(Book, id=book_id)

            # Update book fields
            book.name = data.get('name', book.name)
            book.author = data.get('author', book.author)
            book.year = int(data.get('year', book.year))
            book.genre = data.get('genre', book.genre)
            book.cover = data.get('cover', book.cover)
            book.description = data.get('description', book.description)
            book.rating = float(data.get('rating', book.rating))
            book.reviews = int(data.get('reviews', book.reviews))
            book.language = data.get('language', book.language)
            book.release_date = data.get('release_date', book.release_date)
            book.is_available = data.get('is_available', book.is_available)

            # Save the updated book
            book.save()

            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error'}, status=400)


#-------Youssef-------

from .models import Book, Reader
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password


@csrf_exempt
def signup(request):
    if request.method == 'GET':
        return render(request, 'signup.html')

    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            required_fields = ['first_name', 'last_name', 'email', 'password', 'role']
            if not all(field in data for field in required_fields):
                return JsonResponse({'status': 'error', 'message': 'Missing fields'}, status=400)

            if Reader.objects.filter(email=data['email']).exists():
                return JsonResponse({'status': 'error', 'message': 'Email already used'}, status=409)

            reader = Reader.objects.create(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                password=make_password(data['password']),
                is_admin=(data['role'].lower() == 'admin')
            )

            request.session['reader_id'] = reader.id
            return JsonResponse({'status': 'success', 'reader_id': reader.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def login(request):
    if request.method == 'GET':
        return render(request, 'login.html')

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            reader = Reader.objects.get(email=email)
            if not check_password(password, reader.password):
                return JsonResponse({'status': 'error', 'message': 'Invalid email or password.'}, status=401)

            request.session['reader_id'] = reader.id
            return JsonResponse({'status': 'success', 'reader_id': reader.id})

        except Reader.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Invalid email or password.'}, status=401)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


# def profile(request):
#     reader_id = request.session.get('reader_id')
#     if not reader_id:
#         return JsonResponse({'status': 'error', 'message': 'Not logged in'}, status=401)

@csrf_exempt
def profilereq(request):
    reader_id = request.session.get('reader_id')
    if not reader_id:
        return JsonResponse({'status': 'error', 'message': 'Not logged in'}, status=401)

    reader = get_object_or_404(Reader, id=reader_id)
    
    # ✅ Fetch books borrowed by this reader
    borrowed_books = list(
        ReaderBook.objects.filter(reader=reader).values('book_id', 'return_date', 'status')
    )

    return JsonResponse({
        'first_name': reader.first_name,
        'last_name': reader.last_name,
        'email': reader.email,
        'joined_date': reader.joined_date.strftime('%Y-%m-%d'),
        'profile_pic': reader.profile_pic.url,
        'is_admin': reader.is_admin,
        'userBooks': borrowed_books,
        'id' : reader_id# ✅ Now available in frontend
    })

@csrf_exempt
def BorrowBook(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")
            book_id = data.get("book_id")

            # Create new ReaderBook entry
            reader_book = ReaderBook.objects.create(
                reader_id=user_id,
                book_id=book_id,
                return_date=date.today() + timedelta(days=14),  # example: 2 weeks later
                is_returned=False,
                status="borrowed"
            )

            return JsonResponse({"message": "Book borrowed successfully", "id": reader_book.id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid HTTP method"}, status=405)

@csrf_exempt
def UnborrowBook(request):
    if request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            user_id = data.get("user_id")
            book_id = data.get("book_id")

            # Find the corresponding ReaderBook entry
            reader_book = ReaderBook.objects.get(reader_id=user_id, book_id=book_id, is_returned=False)
            reader_book.delete()

            return JsonResponse({'status': 'success', 'message': 'Book unborrowed successfully'})
        except ReaderBook.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Borrow record not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid HTTP method'}, status=405)


    
@csrf_exempt
def logoutreq(request):
    if request.method == 'POST':
        try:
            # Remove reader_id from session
            if 'reader_id' in request.session:
                del request.session['reader_id']
            
            # Optional: clear entire session if needed
            # request.session.flush()

            return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)
