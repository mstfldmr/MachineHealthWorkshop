#!/bin/bash -v
date

REPOSITORY=https://github.com/mstfldmr/MachineHealthWorkshop
GG_LINK=https://d1onfpft10uf5o.cloudfront.net/greengrass-core/downloads/1.9.4/greengrass-linux-x86-64-1.9.4.tar.gz
GG_FILE=greengrass-linux-x86-64-1.9.4.tar.gz
GG_VER_CUR=1.9.4
INFERENCE_LAMBDA_DIR=/home/ec2-user/environment/Inference


echo LANG=en_US.utf-8 >> /etc/environment
echo LC_ALL=en_US.UTF-8 >> /etc/environment
. /home/ec2-user/.bashrc


echo '=== INSTALL SOFTWARE ==='
cd /tmp
git clone ${REPOSITORY}



yum -y remove aws-cli
yum -y install sqlite telnet jq strace tree gcc glibc-static python27-pip

PATH=$PATH:/usr/local/bin


# python27
for l in boto3 awscli AWSIoTPythonSDK AWSIoTDeviceDefenderAgentSDK \
         greengrasssdk urllib3 geopy pyOpenSSL pandas
do
  pip install $l
done

pip install --upgrade python-daemon


echo '=== Python 3.7 ==='
yum -y install gcc bzip2-devel ncurses-devel gdbm-devel xz-devel \
               sqlite-devel openssl-devel tk-devel uuid-devel \
               readline-devel zlib-devel libffi-devel

test ! -d /usr/local/src && mkdir -p /usr/local/src
cd /usr/local/src
cp /tmp/MachineHealthWorkshop/resources/python37-compiled.tar.gz ./
tar zxf python37-compiled.tar.gz
cd Python-3.7.0/
make install

echo "/usr/local/lib" > /etc/ld.so.conf.d/local.conf
ldconfig

cd /tmp/
for l in boto3 awscli AWSIoTPythonSDK AWSIoTDeviceDefenderAgentSDK \
         greengrasssdk urllib3 geopy pyOpenSSL pandas
do
  /usr/local/bin/pip3 install $l
done

/usr/local/bin/pip3 install --upgrade python-daemon


echo '=== NodeJS ==='
rm -rf /home/ec2-user/.nvm
curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -
yum -y install nodejs
ln -s /usr/bin/node /usr/bin/nodejs8.10


echo '=== CONFIGURE awscli and setting ENVIRONMENT VARS ==='
echo "complete -C '/usr/local/bin/aws_completer' aws" >> /home/ec2-user/.bashrc
#mkdir /home/ec2-user/CA
mkdir /home/ec2-user/.aws
echo '[default]' > /home/ec2-user/.aws/config
echo 'output = json' >> /home/ec2-user/.aws/config
echo "region = $REGION" >> /home/ec2-user/.aws/config
chmod 400 /home/ec2-user/.aws/config
chown -R ec2-user:ec2-user /home/ec2-user/.aws
IOT_ENDPOINT_OLD=$(aws iot describe-endpoint --region $REGION | jq -r '.endpointAddress')
IOT_ENDPOINT=$(aws iot describe-endpoint --region $REGION --endpoint-type iot:Data-ATS | jq -r '.endpointAddress')
echo "export IOT_ENDPOINT_OLD=$IOT_ENDPOINT_OLD" >> /home/ec2-user/.bashrc
echo "export IOT_ENDPOINT=$IOT_ENDPOINT" >> /home/ec2-user/.bashrc
echo 'PATH=$PATH:/usr/local/bin' >> /home/ec2-user/.bashrc
echo 'export PATH' >> /home/ec2-user/.bashrc
cat /home/ec2-user/banner.txt >> /home/ec2-user/.bashrc
rm -f /home/ec2-user/banner.txt
test ! -e /home/ec2-user/.ssh && mkdir -m 700 /home/ec2-user/.ssh


echo '=== PREPARE FOR GREENGRASS ==='

if ! getent passwd ggc_user; then
    echo "adding ggc_user"
    useradd -r ggc_user
fi

echo "-> ggc_group"
if ! getent group ggc_group; then
    echo "adding ggc_group"
    groupadd -r ggc_group
fi

echo "-> hardlink and symlink protection"
if [ -e /etc/sysctl.d/00-defaults.conf ]; then
    if ! grep '^fs.protected_hardlinks\s*=\s*1' /etc/sysctl.d/00-defaults.conf; then
        echo 'fs.protected_hardlinks = 1' >> /etc/sysctl.d/00-defaults.conf
    fi
    if ! grep '^fs.protected_symlinks\s*=\s*1' /etc/sysctl.d/00-defaults.conf; then
        echo 'fs.protected_symlinks = 1' >> /etc/sysctl.d/00-defaults.conf
    fi
else
    echo '# AWS Greengrass' >> /etc/sysctl.d/00-defaults.conf
    echo 'fs.protected_hardlinks = 1' >> /etc/sysctl.d/00-defaults.conf
    echo 'fs.protected_symlinks = 1' >> /etc/sysctl.d/00-defaults.conf
fi

sysctl -p
sysctl -p /etc/sysctl.d/00-defaults.conf

echo '# AWS Greengrass' >> /etc/fstab
echo 'cgroup /sys/fs/cgroup cgroup defaults 0 0' >> /etc/fstab
mount -a


echo '=== Install Greengrass ==='

cd /tmp/
wget ${GG_LINK}
tar -xzvf ${GG_FILE} -C /


echo '=== PREPARE Greengrass ML WORKSHOP ==='

cd /tmp/

test ! -d $INFERENCE_LAMBDA_DIR && mkdir -p $INFERENCE_LAMBDA_DIR
tar -xzvf /tmp/MachineHealthWorkshop/lambdas/inference_lambda.tar.gz -C ${INFERENCE_LAMBDA_DIR}


echo '=== PREPARE REBOOT in 1 minute with at ==='
FILE=$(mktemp)
echo $FILE
echo '#!/bin/bash' > $FILE
echo 'reboot -f --verbose' >> $FILE
at now + 1 minute -f $FILE
date
exit 0
