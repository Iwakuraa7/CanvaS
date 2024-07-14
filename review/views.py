import json

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout

from .models import User, Drawing

def index(request):
    return render(request, "review/index.html")

def login_view(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('index'))

        else:
            return render(request, "review/login.html", {
                "msg": "Not valid username or password."
            })

    else:
        return render(request, "review/login.html")

def register_view(request):
    if request.method == "POST":
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        confirmation = request.POST['confirmation']

        if password != confirmation:
            return render(request, "review/register.html", {
                "msg": "Passwords must match."
            })

        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "review/register.html", {
                "msg": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse('index'))
    else:
        return render(request, "review/register.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))

@login_required(login_url='login')
def user_page(request):
    return render(request, "review/user-page.html")

def edit_drawing(request, drawing_id):
    return render(request, "review/index.html", {
        "edit_drawing": Drawing.objects.get(id=drawing_id),
    })

@csrf_exempt
@login_required(login_url='login')
def save_drawing(request):
    user = request.user
    data = json.loads(request.body)
    if request.method == "POST":
        drawing_url = data.get("drawing_url")
        new_drawing = Drawing(url=drawing_url, user=user)
        new_drawing.save()
        user.drawings.add(new_drawing)
        return JsonResponse({"success": True})
    elif request.method == "PUT":
        edit_drawing_id = data.get("edit_drawing_id")
        edit_drawing_obj = Drawing.objects.get(pk=edit_drawing_id)
        edit_drawing_obj.url = data.get("drawing_url")
        edit_drawing_obj.save()
        return JsonResponse({"success": True})

    return JsonResponse({"error": "POST request required."})

@login_required(login_url='login')
def get_drawings(request, user_id):
    if request.method == "GET":
        user = User.objects.get(pk=user_id)
        return JsonResponse(user.serialize())
    else:
        return JsonResponse({"error": "GET request required."})