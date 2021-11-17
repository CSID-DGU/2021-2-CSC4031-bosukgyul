from django.shortcuts import render
import pdb, json

def ready(request):
    return render(request, 'zooming/ready.html')

def landing(request):
    return render(request, 'zooming/landing.html')

def meeting(request):
    if request.method == "POST":
        username = request.POST.get('username')
        teamname = request.POST.get('teamname')
        videostatus = request.POST.get('video_status')
        audiostatus = request.POST.get('audio_status')

        context = {
            'username' : username,
            'teamname' : teamname,
            'videoStatus' : videostatus,
            'audioStatus' : audiostatus
        }
    # pdb.set_trace() 
    return render(request, 'zooming/main.html', context)
