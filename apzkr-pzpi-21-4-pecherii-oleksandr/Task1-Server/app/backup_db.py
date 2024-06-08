import os
import subprocess
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import DiveComputer, Participation
from .serializers import DiveComputerSerializer


class DiveComputerListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'message': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        dive_computers = DiveComputer.objects.all()
        serializer = DiveComputerSerializer(dive_computers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'message': 'You are not permitted to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        
        dive_computer = DiveComputer.objects.create(depth=0.0, dive_time=0)
        serializer = DiveComputerSerializer(dive_computer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

def get_backup_directory():
    script_directory = os.path.dirname(os.path.abspath(__file__))
    app_directory = os.path.dirname(script_directory)
    backup_directory = os.path.join(app_directory, 'backups')
    if not os.path.exists(backup_directory):
        os.makedirs(backup_directory)
    return backup_directory

def backup_database(host, port, database, user, password):
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_directory = get_backup_directory()
        backup_file = os.path.join(backup_directory, f'backup_{timestamp}.sql')

        pg_dump_path = 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe'

        pg_dump_command = [
            pg_dump_path,
            '-h', host,
            '-p', port,
            '-U', user,
            '-d', database,
            '-Fc',
            '-f', backup_file
        ]

        env = os.environ.copy()
        env['PGPASSWORD'] = password

        subprocess.run(pg_dump_command, check=True, env=env)

        return backup_file

    except subprocess.CalledProcessError as error:
        raise RuntimeError(f"Error while backing up PostgreSQL database: {error}")