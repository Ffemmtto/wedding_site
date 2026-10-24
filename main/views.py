from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import user_passes_test
from .models import Guest, Wish
import json

def is_superuser(user):
    return user.is_authenticated and user.is_superuser

def index(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            action = data.get('action')
            
            if action == 'rsvp':
                Guest.objects.create(
                    first_name=data.get('first_name'),
                    last_name=data.get('last_name'),
                    status=data.get('status')
                )
                return JsonResponse({'status': 'success', 'msg': 'Благодарим за ответ!'})
                
            elif action == 'wish':
                Wish.objects.create(
                    name=data.get('name'),
                    text=data.get('text')
                )
                return JsonResponse({'status': 'success', 'msg': 'Спасибо за ваши теплые слова!'})
                
        except Exception as e:
            return JsonResponse({'status': 'error', 'msg': 'Произошла ошибка.'})

    wishes = Wish.objects.all().order_by('-created_at')
    return render(request, 'main/index.html', {'wishes': wishes})

def admin_login(request):
    if request.user.is_authenticated and request.user.is_superuser:
        return redirect('dashboard')
        
    if request.method == 'POST':
        u = request.POST.get('username')
        p = request.POST.get('password')
        user = authenticate(request, username=u, password=p)
        if user is not None and user.is_superuser:
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'main/admin_login.html', {'error': 'Доступ разрешен только организаторам'})
    return render(request, 'main/admin_login.html')

@user_passes_test(is_superuser, login_url='/login/')
def dashboard(request):
    guests = Guest.objects.all().order_by('-created_at')
    wishes = Wish.objects.all().order_by('-created_at')
    stats = {
        'total': guests.count(),
        'alone': guests.filter(status='alone').count(),
        'spouse': guests.filter(status='spouse').count(),
        'no': guests.filter(status='no').count(),
    }
    return render(request, 'main/admin_dashboard.html', {'guests': guests, 'wishes': wishes, 'stats': stats})

@user_passes_test(is_superuser, login_url='/login/')
def edit_wish(request, wish_id):
    wish = get_object_or_404(Wish, id=wish_id)
    if request.method == 'POST':
        wish.text = request.POST.get('text')
        wish.save()
        return redirect('dashboard')
    return render(request, 'main/edit_wish.html', {'wish': wish})

@user_passes_test(is_superuser, login_url='/login/')
def delete_wish(request, wish_id):
    Wish.objects.filter(id=wish_id).delete()
    return redirect('dashboard')